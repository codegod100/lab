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

    // Add the player to the game
    {
        let mut game_lock = game.lock().unwrap();
        game_lock.add_player(player_name.clone())?;
    }

    // Send welcome message
    let welcome = r#"
==============================================
 WELCOME TO THE TEXT ADVENTURE GAME
==============================================

You find yourself at the entrance of a mysterious cave.
Type 'look' to see your surroundings.
Type 'help' for a list of commands.

"#;

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

    // Main game loop
    loop {
        match socket.read(&mut buffer).await {
            Ok(0) => {
                // Connection closed
                break;
            }
            Ok(n) => {
                // Process the command
                let command = String::from_utf8_lossy(&buffer[..n]).trim().to_string();

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
