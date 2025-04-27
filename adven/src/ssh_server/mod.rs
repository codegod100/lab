use std::sync::{Arc, Mutex};
use std::net::SocketAddr;
use std::path::Path;
use std::collections::HashMap;
use std::fs;
use std::io::Write;

use anyhow::Result;
use async_trait::async_trait;
use bytes::Bytes;
use russh::server::{self, Auth};
use russh::{Channel, ChannelId, CryptoVec};
use russh_keys::key::{KeyPair, PublicKey};
use tokio::sync::Mutex as TokioMutex;

use crate::game::Game;

// Type alias for a player session
type PlayerSession = Arc<TokioMutex<PlayerState>>;

// Player state for SSH sessions
struct PlayerState {
    name: String,
    buffer: String,
}

impl PlayerState {
    fn new(name: String) -> Self {
        Self {
            name,
            buffer: String::new(),
        }
    }
}

// SSH server handler
pub struct SshServer {
    game: Arc<Mutex<Game>>,
    clients: Arc<Mutex<HashMap<(usize, ChannelId), PlayerSession>>>,
}

impl SshServer {
    pub fn new(game: Arc<Mutex<Game>>) -> Self {
        Self {
            game,
            clients: Arc::new(Mutex::new(HashMap::new())),
        }
    }
}

// Implementation of the SSH server handler
impl server::Server for SshServer {
    type Handler = SshSession;

    fn new_client(&mut self, _addr: Option<std::net::SocketAddr>) -> Self::Handler {
        SshSession {
            game: self.game.clone(),
            clients: self.clients.clone(),
            player_name: None,
        }
    }
}

// SSH session handler
pub struct SshSession {
    game: Arc<Mutex<Game>>,
    clients: Arc<Mutex<HashMap<(usize, ChannelId), PlayerSession>>>,
    player_name: Option<String>,
}

// Custom enum for channel request responses
enum ChannelRequest {
    Accept,
    Reject,
}

#[async_trait]
impl server::Handler for SshSession {
    type Error = anyhow::Error;

    // Handle authentication with public key
    async fn auth_publickey(&mut self, username: &str, _public_key: PublicKey) -> Result<Auth, Self::Error> {
        // In a real implementation, you would verify the public key against authorized keys
        // For this example, we'll accept any key
        println!("Authenticating user {} with public key", username);
        self.player_name = Some(username.to_string());
        Ok(Auth::Accept)
    }

    // Handle password authentication (we'll disable this for security)
    async fn auth_password(&mut self, username: &str, _password: &str) -> Result<Auth, Self::Error> {
        // For security, we'll reject password authentication
        println!("Password authentication attempted by user {} (rejected)", username);
        Ok(Auth::Reject)
    }

    // Handle channel open
    async fn channel_open_session(
        &mut self,
        channel: Channel<russh::server::Msg>,
        session_id: usize,
    ) -> Result<(Self, bool, Channel<russh::server::Msg>), Self::Error> {
        println!("Channel opened for session {}", session_id);
        Ok((self.clone(), true, channel))
    }

    // Handle channel requests
    async fn channel_request(
        self,
        channel_id: ChannelId,
        request: russh::ChannelRequest,
        mut channel: Channel<russh::server::Msg>,
        session_id: usize,
    ) -> Result<(Self, ChannelRequest), Self::Error> {
        match request {
            russh::ChannelRequest::Shell { want_reply } => {
                if want_reply {
                    channel.confirmation().await?;
                }

                // Generate a unique player name
                let player_name = match &self.player_name {
                    Some(name) => name.clone(),
                    None => format!("player_{}_{}", session_id, channel_id),
                };

                // Create player state
                let player_state = Arc::new(TokioMutex::new(PlayerState::new(player_name.clone())));

                // Store the player session
                {
                    let mut clients = self.clients.lock().unwrap();
                    clients.insert((session_id, channel_id), player_state);
                }

                // Add the player to the game
                {
                    let mut game_lock = self.game.lock().unwrap();
                    if let Err(e) = game_lock.add_player(player_name.clone()) {
                        eprintln!("Error adding player: {}", e);
                    }
                }

                // Send welcome message
                let welcome = format!(r#"
==============================================
 WELCOME TO THE TEXT ADVENTURE GAME
==============================================

You are logged in as: {}
You find yourself at the entrance of a mysterious cave.
Type 'look' to see your surroundings.
Type 'help' for a list of commands.

"#, player_name);

                let welcome_bytes = welcome.into_bytes();
                channel.data(&welcome_bytes).await?;

                // Show the initial room description
                let room_description = {
                    let game_lock = self.game.lock().unwrap();
                    game_lock.get_room_description(&player_name)
                };

                let desc_bytes = room_description.into_bytes();
                channel.data(&desc_bytes).await?;

                let prompt = b"\n> ".to_vec();
                channel.data(&prompt).await?;

                Ok((self, ChannelRequest::Accept))
            }
            _ => Ok((self, ChannelRequest::Reject)),
        }
    }

    // Handle data received from the client
    async fn data(
        self,
        channel_id: ChannelId,
        data: &[u8],
        mut channel: Channel<russh::server::Msg>,
        session_id: usize,
    ) -> Result<(Self, server::Session), Self::Error> {
        // Get the player session
        let player_session = {
            let clients = self.clients.lock().unwrap();
            match clients.get(&(session_id, channel_id)) {
                Some(session) => session.clone(),
                None => {
                    eprintln!("Player not found for session {} channel {}", session_id, channel_id);
                    return Ok((self, server::Session::Continue));
                }
            }
        };

        // Process the data
        let mut player = player_session.lock().await;

        // Convert data to string and append to buffer
        if let Ok(input) = std::str::from_utf8(data) {
            player.buffer.push_str(input);

            // Check if we have a complete command (ends with newline)
            if player.buffer.contains('\n') || player.buffer.contains('\r') {
                // Extract the command
                let command = player.buffer.trim().to_string();
                player.buffer.clear();

                // Handle exit/quit command
                if command == "quit" || command == "exit" {
                    let goodbye = b"Goodbye!\n".to_vec();
                    channel.data(&goodbye).await?;

                    // Remove the player from the game
                    {
                        let mut game_lock = self.game.lock().unwrap();
                        game_lock.remove_player(&player.name);
                    }

                    // Remove the player from the clients map
                    {
                        let mut clients = self.clients.lock().unwrap();
                        clients.remove(&(session_id, channel_id));
                    }

                    println!("Connection closed for {}", player.name);

                    // Close the channel
                    channel.eof().await?;
                    channel.close().await?;

                    return Ok((self, server::Session::Continue));
                }

                // Process the command in the game
                let response = {
                    let mut game_lock = self.game.lock().unwrap();
                    game_lock.process_command(&player.name, &command)
                };

                // Send the response
                let response_bytes = response.into_bytes();
                channel.data(&response_bytes).await?;

                let prompt = b"\n> ".to_vec();
                channel.data(&prompt).await?;
            }
        }

        Ok((self, server::Session::Continue))
    }
}

impl Clone for SshSession {
    fn clone(&self) -> Self {
        SshSession {
            game: self.game.clone(),
            clients: self.clients.clone(),
            player_name: self.player_name.clone(),
        }
    }
}

// Load or generate server keys
fn load_server_keys() -> Result<KeyPair> {
    let key_path = Path::new("ssh_host_key");

    if !key_path.exists() {
        println!("Generating new SSH server key...");
        let key = KeyPair::generate_ed25519().unwrap();

        // Create the directory if it doesn't exist
        if let Some(parent) = key_path.parent() {
            fs::create_dir_all(parent)?;
        }

        // Save the private key
        let key_bytes = key.export_openssh_private_key()?;
        let mut file = fs::File::create(key_path)?;
        file.write_all(&key_bytes)?;

        // Save the public key
        let pub_key_path = key_path.with_extension("pub");
        let pub_key_bytes = key.clone_public_key().unwrap().public_key_bytes();
        let mut pub_file = fs::File::create(pub_key_path)?;
        pub_file.write_all(&pub_key_bytes)?;

        println!("SSH server key generated successfully");

        return Ok(key);
    }

    // Load the key from the file
    println!("Loading SSH server key...");
    let key_data = fs::read(key_path)?;
    let key = KeyPair::from_openssh_private_key(&key_data, None)?;

    Ok(key)
}

/// Start the SSH server for the text adventure game
pub async fn start_server(addr: &str, game: Arc<Mutex<Game>>) -> Result<()> {
    // Load or generate server keys
    let key = load_server_keys()?;

    // Create the server config
    let config = russh::server::Config {
        inactivity_timeout: Some(std::time::Duration::from_secs(600)), // 10 minutes
        auth_rejection_time: std::time::Duration::from_secs(3),
        keys: vec![key],
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

    // Create the server
    let server = russh::server::Server::new(config);

    // Run the server
    server.run(socket_addr, server_handler).await?;

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
    println!("3. The server will authenticate you using your SSH key");
    println!("   No password is required");
    println!("=== END OF SSH CONNECTION INSTRUCTIONS ===\n");
}
