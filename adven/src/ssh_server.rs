use std::sync::{Arc, Mutex};
use std::net::SocketAddr;
use std::path::Path;
use std::fs;
use std::io::Write;

use anyhow::Result;
use async_trait::async_trait;
use russh::server::{self, Auth, Session};
use russh::{Channel, ChannelId, CryptoVec};
use russh_keys::{key::{KeyPair, PublicKey}, PublicKeyBase64};

use crate::game::Game;

// SSH server handler
pub struct SshServer {
    game: Arc<Mutex<Game>>,
    clients: Arc<Mutex<std::collections::HashMap<(usize, ChannelId), String>>>,
    id: usize,
}

impl SshServer {
    pub fn new(game: Arc<Mutex<Game>>) -> Self {
        Self {
            game,
            clients: Arc::new(Mutex::new(std::collections::HashMap::new())),
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

        let welcome_crypto = CryptoVec::from_slice(welcome.as_bytes());
        session.data(channel_id, welcome_crypto);

        // Show the initial room description
        let room_description = {
            let game_lock = self.game.lock().unwrap();
            game_lock.get_room_description(&player_name)
        };

        let desc_crypto = CryptoVec::from_slice(room_description.as_bytes());
        session.data(channel_id, desc_crypto);

        let prompt = CryptoVec::from_slice(b"\n> ");
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

        // Process the command
        let command = String::from_utf8_lossy(data).trim().to_string();

        if command == "quit" || command == "exit" {
            let goodbye = CryptoVec::from_slice(b"Goodbye!\n");
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
        let response_crypto = CryptoVec::from_slice(response.as_bytes());
        session.data(channel_id, response_crypto);

        let prompt = CryptoVec::from_slice(b"\n> ");
        session.data(channel_id, prompt);

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

        // Get the player name
        let player_name_opt = {
            let clients = self.clients.lock().unwrap();
            clients.iter()
                .find(|((_, cid), _)| *cid == channel_id)
                .map(|((_, _), name)| name.clone())
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
            id: self.id,
        }
    }
}

// Load or generate server keys
fn load_server_keys() -> Result<Vec<KeyPair>> {
    let key_path = Path::new("ssh_host_key");

    if !key_path.exists() {
        println!("Generating new SSH server key...");
        let key = KeyPair::generate_ed25519().unwrap();

        // Create the directory if it doesn't exist
        if let Some(parent) = key_path.parent() {
            if !parent.exists() {
                fs::create_dir_all(parent)?;
            }
        }

        // Save the key to a file
        let key_bytes = key.clone().public_key_base64();
        let mut file = std::fs::File::create(key_path)?;
        file.write_all(key_bytes.as_bytes())?;

        return Ok(vec![key]);
    }

    // Load the key from the file
    println!("Loading server key...");
    // In a real implementation, we would load the key from the file
    // let key_data = fs::read_to_string(key_path)?;
    // let key = KeyPair::from_private_key_base64(&key_data)?;
    let key = KeyPair::generate_ed25519().unwrap(); // For now, just generate a new key

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
    println!("3. The server will authenticate you using your SSH key");
    println!("   No password is required");
    println!("=== END OF SSH CONNECTION INSTRUCTIONS ===\n");
}
