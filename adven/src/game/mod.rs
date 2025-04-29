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

    /// Add a new player to the game with SSH key information
    pub fn add_player_with_ssh_info(&mut self, name: String, ssh_key_type: Option<String>, ssh_key_comment: Option<String>) -> Result<()> {
        if self.players.contains_key(&name) {
            return Err(anyhow::anyhow!("Player already exists"));
        }

        let starting_room = self.world.starting_room_id();
        let player = Player::new_with_ssh_info(name.clone(), starting_room, ssh_key_type, ssh_key_comment);
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

        // Use the terminal formatting module
        let title = room.name();
        let mut description = crate::terminal::format_room_title(title);
        description.push_str(&crate::terminal::format_room_description(room.description()));

        // Format exits
        let exits = room.exits();
        let exit_names: Vec<String> = exits.keys().map(|k| k.to_string()).collect();
        description.push_str(&crate::terminal::format_exits(&exit_names));

        // Format items
        let items = room.items();
        let item_names: Vec<String> = items.iter().map(|i| i.name().to_string()).collect();
        description.push_str(&crate::terminal::format_items(&item_names));

        description
    }

    /// Get SSH information display for a player
    pub fn get_player_ssh_info(&self, player_name: &str) -> Option<String> {
        self.players.get(player_name).map(|p| p.ssh_info_display())
    }

    /// Get a shared reference to the game that can be used across threads
    pub fn shared() -> Arc<Mutex<Game>> {
        Arc::new(Mutex::new(Game::new()))
    }
}
