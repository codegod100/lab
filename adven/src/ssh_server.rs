use std::sync::{Arc, Mutex};
use std::net::SocketAddr;
use std::collections::HashMap;
use std::path::Path;

use anyhow::Result;
use async_trait::async_trait;
use russh::server::{self, Auth, Session};
use russh::{Channel, ChannelId, CryptoVec};
use russh_keys::key::{KeyPair, PublicKey};
use russh_keys::load_secret_key;

use crate::game::Game;

// SSH server handler
pub struct SshServer {
    game: Arc<Mutex<Game>>,
    clients: Arc<Mutex<HashMap<(usize, ChannelId), String>>>,
    // Buffer to store partial input for each client
    input_buffers: Arc<Mutex<HashMap<(usize, ChannelId), String>>>,
    id: usize,
}

impl SshServer {
    pub fn new(game: Arc<Mutex<Game>>) -> Self {
        Self {
            game,
            clients: Arc::new(Mutex::new(HashMap::new())),
            input_buffers: Arc::new(Mutex::new(HashMap::new())),
            id: 0,
        }
    }
}

// Implementation of the SSH server handler
impl server::Server for SshServer {
    type Handler = Self;

    fn new_client(&mut self, _addr: Option<std::net::SocketAddr>) -> Self::Handler {
        let s = self.clone();
        self.id += 1;
        s
    }
}

#[async_trait]
impl server::Handler for SshServer {
    type Error = anyhow::Error;

    // Handle authentication with public key
    async fn auth_publickey(self, username: &str, _public_key: &PublicKey) -> Result<(Self, Auth), Self::Error> {
        // In a real implementation, you would verify the public key against authorized keys
        // For this example, we'll accept any key
        println!("Authenticating user {} with public key", username);
        Ok((self, Auth::Accept))
    }

    // Handle password authentication (we'll disable this for security)
    async fn auth_password(self, username: &str, _password: &str) -> Result<(Self, Auth), Self::Error> {
        // For security, we'll reject password authentication
        println!("Password authentication attempted by user {} (rejected)", username);
        Ok((self, Auth::Reject { proceed_with_methods: None }))
    }

    // Handle channel open
    async fn channel_open_session(
        self,
        channel: Channel<russh::server::Msg>,
        session: Session,
    ) -> Result<(Self, bool, Session), Self::Error> {
        println!("Channel opened for session {}", self.id);

        // Generate a unique player name based on the session
        let player_name = format!("player_{}", self.id);

        // Store the player name
        {
            let mut clients = self.clients.lock().unwrap();
            clients.insert((self.id, channel.id()), player_name.clone());
        }

        // Add the player to the game
        {
            let mut game_lock = self.game.lock().unwrap();
            if let Err(e) = game_lock.add_player(player_name.clone()) {
                eprintln!("Error adding player: {}", e);
            }
        }

        Ok((self, true, session))
    }

    // Handle shell requests
    async fn shell_request(
        self,
        channel_id: ChannelId,
        mut session: Session,
    ) -> Result<(Self, Session), Self::Error> {
        // Create a clone of self for later use
        let self_clone = self.clone();

        // Get the player name
        let player_name_opt = {
            let clients = self.clients.lock().unwrap();
            clients.iter()
                .find(|((_, cid), _)| *cid == channel_id)
                .map(|((_, _), name)| name.clone())
        };

        let player_name = match player_name_opt {
            Some(name) => name,
            None => {
                eprintln!("Player not found for channel {}", channel_id);
                return Ok((self_clone, session));
            }
        };

        // We'll implement local echo in the data handler instead of relying on terminal modes
        // since we don't have direct access to set terminal modes in the russh API

        // Send welcome message using the terminal formatting module
        let welcome = crate::terminal::format_welcome_message(&player_name);

        let welcome_crypto = CryptoVec::from_slice(welcome.as_bytes());
        session.data(channel_id, welcome_crypto);

        // Show the initial room description
        let room_description = {
            let game_lock = self.game.lock().unwrap();
            game_lock.get_room_description(&player_name)
        };

        let desc_crypto = CryptoVec::from_slice(room_description.as_bytes());
        session.data(channel_id, desc_crypto);

        // Send the initial prompt
        let prompt = CryptoVec::from_slice(crate::terminal::format_prompt().as_bytes());
        session.data(channel_id, prompt);

        Ok((self_clone, session))
    }

    // Handle data received from the client
    async fn data(
        self,
        channel_id: ChannelId,
        data: &[u8],
        mut session: Session,
    ) -> Result<(Self, Session), Self::Error> {
        // Create a copy of self for later use
        let self_clone = self.clone();

        // Get the player name and session ID
        let (player_name, session_id) = {
            let clients = self.clients.lock().unwrap();
            match clients.iter()
                .find(|((_, cid), _)| *cid == channel_id)
                .map(|((sid, _), name)| (name.clone(), *sid)) {
                Some((name, sid)) => (name, sid),
                None => {
                    eprintln!("Player not found for channel {}", channel_id);
                    return Ok((self_clone, session));
                }
            }
        };

        // Get the input data as a string
        let input_str = match std::str::from_utf8(data) {
            Ok(s) => s,
            Err(_) => {
                eprintln!("Invalid UTF-8 in input");
                return Ok((self_clone, session));
            }
        };

        // Debug: Print the raw input data
        println!("Raw input: {:?}", data);

        // Implement local echo with proper backspace handling
        // Process each character for proper terminal display
        for &byte in data {
            match byte {
                // Handle backspace (ASCII BS or DEL)
                8 | 127 => {
                    // Send backspace sequence: BS + space + BS
                    // This moves cursor back, overwrites with space, then moves back again
                    let backspace_seq = CryptoVec::from_slice(b"\x08 \x08");
                    session.data(channel_id, backspace_seq);
                },
                // For all other characters, just echo them back
                _ => {
                    let echo_char = CryptoVec::from_slice(&[byte]);
                    session.data(channel_id, echo_char);
                }
            }
        }

        // Append the new data to the input buffer for this client
        let mut command_to_process = None;
        {
            let mut buffers = self.input_buffers.lock().unwrap();
            let buffer = buffers.entry((session_id, channel_id)).or_insert(String::new());

            // Process the input data
            for c in input_str.chars() {
                match c {
                    // Handle backspace (ASCII BS or DEL)
                    '\x08' | '\x7f' => {
                        if !buffer.is_empty() {
                            buffer.pop();
                        }
                    },
                    // Skip other control characters except newline and carriage return
                    c if c < ' ' && c != '\n' && c != '\r' => {
                        // Skip control characters
                    },
                    // Add normal characters to the buffer
                    _ => buffer.push(c),
                }
            }

            // Check if we have a complete line (ends with newline)
            if buffer.contains('\n') || buffer.contains('\r') {
                // Extract the line up to the newline
                let line = buffer.clone();
                // Clear the buffer for next time
                buffer.clear();

                // Process the complete line
                let cmd = line
                    .replace('\r', "")  // Remove carriage returns
                    .replace('\n', "")  // Remove newlines
                    .trim()
                    .to_string();

                if !cmd.is_empty() {
                    command_to_process = Some(cmd);
                }
            }
        }

        // If we have a command to process, do it
        if let Some(command) = command_to_process {
            if command == "quit" || command == "exit" {
                let goodbye = CryptoVec::from_slice(b"\r\nGoodbye!\r\n");
                session.data(channel_id, goodbye);

                // Remove the player from the game
                {
                    let mut game_lock = self.game.lock().unwrap();
                    game_lock.remove_player(&player_name);
                }

                // Remove the player from the clients map
                {
                    let mut clients = self.clients.lock().unwrap();
                    clients.retain(|(_, cid), _| *cid != channel_id);
                }

                // Remove the input buffer
                {
                    let mut buffers = self.input_buffers.lock().unwrap();
                    buffers.remove(&(session_id, channel_id));
                }

                println!("Connection closed for {}", player_name);

                // Close the channel
                session.eof(channel_id);
                session.close(channel_id);

                return Ok((self_clone, session));
            }

            // Process the command in the game
            let response = {
                let mut game_lock = self.game.lock().unwrap();
                game_lock.process_command(&player_name, &command)
            };

            // Send the response
            let response_crypto = CryptoVec::from_slice(format!("\r\n{}", response).as_bytes());
            session.data(channel_id, response_crypto);

            let prompt = CryptoVec::from_slice(crate::terminal::format_prompt().as_bytes());
            session.data(channel_id, prompt);
        } else if input_str.contains('\n') || input_str.contains('\r') {
            // If we got a newline but no command (empty line), just show the prompt
            let prompt = CryptoVec::from_slice(crate::terminal::format_prompt().as_bytes());
            session.data(channel_id, prompt);
        }

        Ok((self_clone, session))
    }

    // Handle channel close
    async fn channel_close(
        self,
        channel_id: ChannelId,
        session: Session,
    ) -> Result<(Self, Session), Self::Error> {
        // Create a copy of self for later use
        let self_clone = self.clone();

        // Get the player name and session ID
        let (player_name_opt, session_id_opt) = {
            let clients = self.clients.lock().unwrap();
            clients.iter()
                .find(|((_, cid), _)| *cid == channel_id)
                .map(|((sid, _), name)| (Some(name.clone()), Some(*sid)))
                .unwrap_or((None, None))
        };

        if let Some(player_name) = player_name_opt {
            // Remove the player from the game
            {
                let mut game_lock = self.game.lock().unwrap();
                game_lock.remove_player(&player_name);
            }

            // Remove the player from the clients map
            {
                let mut clients = self.clients.lock().unwrap();
                clients.retain(|(_, cid), _| *cid != channel_id);
            }

            // Remove the input buffer if we have a session ID
            if let Some(session_id) = session_id_opt {
                let mut buffers = self.input_buffers.lock().unwrap();
                buffers.remove(&(session_id, channel_id));
            }

            println!("Channel closed for {}", player_name);
        }

        Ok((self_clone, session))
    }

    // Handle channel EOF
    async fn channel_eof(
        self,
        channel_id: ChannelId,
        session: Session,
    ) -> Result<(Self, Session), Self::Error> {
        println!("Channel EOF received for {}", channel_id);
        Ok((self, session))
    }
}

impl Clone for SshServer {
    fn clone(&self) -> Self {
        SshServer {
            game: self.game.clone(),
            clients: self.clients.clone(),
            input_buffers: self.input_buffers.clone(),
            id: self.id,
        }
    }
}

// Load or generate server keys
fn load_server_keys() -> Result<Vec<KeyPair>> {
    let secret_key_path = Path::new("ssh_host_key");
    let key = load_secret_key(secret_key_path, None)?;
    Ok(vec![key])
}

/// Start the SSH server for the text adventure game
pub async fn start_server(addr: &str, game: Arc<Mutex<Game>>) -> Result<()> {
    // Create the server config
    let config = russh::server::Config {
        inactivity_timeout: Some(std::time::Duration::from_secs(600)), // 10 minutes
        auth_rejection_time: std::time::Duration::from_secs(3),
        keys: load_server_keys()?,
        ..Default::default()
    };

    // Create the server handler
    let server_handler = SshServer::new(game);

    // Parse the address
    let socket_addr: SocketAddr = addr.parse()?;

    // Start the SSH server
    println!("SSH server starting on {}", addr);
    println!("Players can connect using: ssh -p {} username@localhost", socket_addr.port());
    println!("Note: The server accepts any SSH key for authentication");
    println!("      No password authentication is allowed for security");

    // Run the server
    russh::server::run(config.into(), socket_addr, server_handler).await?;

    Ok(())
}

/// Instructions for setting up SSH authentication
pub fn print_ssh_instructions() {
    println!("\n=== SSH CONNECTION INSTRUCTIONS ===");
    println!("To connect to the game server using SSH:");
    println!();
    println!("1. Generate an SSH key pair if you don't have one:");
    println!("   ssh-keygen -t ed25519");
    println!();
    println!("2. Connect to the server using your SSH key:");
    println!("   ssh -p 3333 username@localhost");
    println!();
    println!("   Note: You may see a warning about the host key changing.");
    println!("         This is expected in development mode.");
    println!("         You can use the following command to bypass the warning:");
    println!("         ssh -o StrictHostKeyChecking=no -p 3333 username@localhost");
    println!();
    println!("3. If you can't see what you're typing, enable local echo in your SSH client");
    println!("   Most SSH clients have local echo enabled by default");
    println!("   In PuTTY, you can enable it in Terminal > Features > Local echo: Force on");
    println!();
    println!("4. The server will authenticate you using your SSH key");
    println!("   No password is required");
    println!("=== END OF SSH CONNECTION INSTRUCTIONS ===\n");
}
