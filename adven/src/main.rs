mod game;
mod ssh;
mod ssh_server;
mod terminal;

use anyhow::Result;
use tokio;

use game::Game;

#[tokio::main]
async fn main() -> Result<()> {
    // Initialize logger
    env_logger::init();

    println!("Starting Text Adventure Game Server...");

    // Create the game
    let game = Game::shared();

    // Print SSH instructions for users
    ssh_server::print_ssh_instructions();

    // Start the SSH server on port 3333
    println!("\nServer starting on 0.0.0.0:3333");

    // Start the SSH server
    ssh_server::start_server("0.0.0.0:3333", game).await?;

    Ok(())
}
