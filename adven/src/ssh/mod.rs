use std::sync::{Arc, Mutex};
use std::net::SocketAddr;
use std::path::Path;
use anyhow::Result;
use tokio::net::{TcpListener, TcpStream};
use tokio::io::{AsyncReadExt, AsyncWriteExt};
use std::collections::HashMap;
use std::io::Write;
use std::fs;

use crate::game::Game;

/// Start the TCP server for the text adventure game
pub async fn start_server(addr: &str, game: Arc<Mutex<Game>>) -> Result<()> {
    let socket_addr: SocketAddr = addr.parse()?;
    let listener = TcpListener::bind(socket_addr).await?;

    println!("Text adventure server listening on {}", addr);
    println!("Connect with: telnet localhost {}", socket_addr.port());

    loop {
        match listener.accept().await {
            Ok((socket, addr)) => {
                println!("New connection from: {}", addr);
                let game_clone = game.clone();
                tokio::spawn(async move {
                    if let Err(e) = handle_connection(socket, game_clone).await {
                        eprintln!("Error handling connection: {}", e);
                    }
                });
            }
            Err(e) => {
                eprintln!("Error accepting connection: {}", e);
            }
        }
    }
}

/// Handle a client connection
async fn handle_connection(mut socket: TcpStream, game: Arc<Mutex<Game>>) -> Result<()> {
    // Generate a unique player name based on the socket address
    let player_name = format!("player_{}", socket.peer_addr()?.port());

    // Add the player to the game with TCP connection info as SSH key info
    {
        let mut game_lock = game.lock().unwrap();
        let key_type = Some("tcp".to_string());
        let key_comment = Some(format!("TCP connection from {}", socket.peer_addr()?));
        game_lock.add_player_with_ssh_info(player_name.clone(), key_type, key_comment)?;
    }

    // Get SSH key information for the player
    let ssh_info_display = {
        let game_lock = game.lock().unwrap();
        game_lock.get_player_ssh_info(&player_name)
    };

    // Send welcome message
    let welcome = format!(r#"
WELCOME TO THE TEXT ADVENTURE

You are logged in as: {} ({})

You find yourself at the entrance of a mysterious cave.
Type 'look' to see your surroundings.
Type 'help' for a list of commands.

"#, player_name, ssh_info_display.unwrap_or_else(|| "Unknown user".to_string()));

    socket.write_all(welcome.as_bytes()).await?;

    // Show the initial room description
    let room_description = {
        let game_lock = game.lock().unwrap();
        game_lock.get_room_description(&player_name)
    };

    socket.write_all(room_description.as_bytes()).await?;
    socket.write_all(b"\n> ").await?;

    // Buffer for reading input
    let mut buffer = [0u8; 1024];
    // String buffer to accumulate partial lines
    let mut line_buffer = String::new();

    // Main game loop
    loop {
        match socket.read(&mut buffer).await {
            Ok(0) => {
                // Connection closed
                break;
            }
            Ok(n) => {
                // Convert the bytes to a string
                let data = String::from_utf8_lossy(&buffer[..n]).to_string();

                // Debug: Print the raw input data
                println!("TCP Raw input: {:?}", &buffer[..n]);

                // Append to our line buffer
                line_buffer.push_str(&data);

                // Check if we have a complete line
                if !line_buffer.contains('\n') && !line_buffer.contains('\r') {
                    // No complete line yet, continue reading
                    continue;
                }

                // Process the command (remove newlines and carriage returns)
                let command = line_buffer
                    .replace('\r', "")
                    .replace('\n', "")
                    .trim()
                    .to_string();

                // Clear the line buffer for the next command
                line_buffer.clear();

                // Skip empty commands
                if command.is_empty() {
                    socket.write_all(b"\n> ").await?;
                    continue;
                }

                if command == "quit" || command == "exit" {
                    socket.write_all(b"Goodbye!\n").await?;
                    break;
                }

                let response = {
                    let mut game_lock = game.lock().unwrap();
                    game_lock.process_command(&player_name, &command)
                };

                socket.write_all(response.as_bytes()).await?;
                socket.write_all(b"\n> ").await?;
            }
            Err(e) => {
                eprintln!("Error reading from socket: {}", e);
                break;
            }
        }
    }

    // Remove the player from the game
    {
        let mut game_lock = game.lock().unwrap();
        game_lock.remove_player(&player_name);
    }

    println!("Connection closed for {}", player_name);

    Ok(())
}
