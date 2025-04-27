pub mod world;
pub mod player;
pub mod commands;
pub mod content;

use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use anyhow::Result;

use self::player::Player;
use self::world::World;
use self::commands::Command;

/// The main game engine that manages the game state
pub struct Game {
    world: World,
    players: HashMap<String, Player>,
}

impl Game {
    /// Create a new game instance with the default world
    pub fn new() -> Self {
        let world = content::create_world();

        Game {
            world,
            players: HashMap::new(),
        }
    }

    /// Add a new player to the game
    pub fn add_player(&mut self, name: String) -> Result<()> {
        if self.players.contains_key(&name) {
            return Err(anyhow::anyhow!("Player already exists"));
        }

        let starting_room = self.world.starting_room_id();
        let player = Player::new(name.clone(), starting_room);
        self.players.insert(name, player);

        Ok(())
    }

    /// Remove a player from the game
    pub fn remove_player(&mut self, name: &str) {
        self.players.remove(name);
    }

    /// Process a command from a player and return the result
    pub fn process_command(&mut self, player_name: &str, input: &str) -> String {
        let player = match self.players.get_mut(player_name) {
            Some(p) => p,
            None => return "Player not found".to_string(),
        };

        let command = Command::parse(input);
        match command.execute(player, &mut self.world) {
            Ok(output) => output,
            Err(e) => format!("Error: {}", e),
        }
    }

    /// Get the current room description for a player
    pub fn get_room_description(&self, player_name: &str) -> String {
        let player = match self.players.get(player_name) {
            Some(p) => p,
            None => return "Player not found".to_string(),
        };

        let room_id = player.current_room();
        let room = match self.world.get_room(room_id) {
            Some(r) => r,
            None => return "You are in a void. Something went wrong.".to_string(),
        };

        let mut description = format!("\n== {} ==\n\n{}\n", room.name(), room.description());

        // Add exits
        let exits = room.exits();
        if !exits.is_empty() {
            description.push_str("\nExits: ");
            description.push_str(&exits.keys().map(|k| k.to_string()).collect::<Vec<_>>().join(", "));
        }

        // Add items in the room
        let items = room.items();
        if !items.is_empty() {
            description.push_str("\n\nYou can see: ");
            description.push_str(&items.iter().map(|i| i.name().to_string()).collect::<Vec<_>>().join(", "));
        }

        description
    }

    /// Get a shared reference to the game that can be used across threads
    pub fn shared() -> Arc<Mutex<Game>> {
        Arc::new(Mutex::new(Game::new()))
    }
}
