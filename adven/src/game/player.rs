use serde::{Serialize, Deserialize};

use super::world::Item;

/// Represents a player in the game
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Player {
    name: String,
    current_room: String,
    inventory: Vec<Item>,
    // Additional player information from SSH key
    ssh_key_comment: Option<String>,
    ssh_key_type: Option<String>,
}

impl Player {
    pub fn new(name: String, starting_room: &str) -> Self {
        Player {
            name,
            current_room: starting_room.to_string(),
            inventory: Vec::new(),
            ssh_key_comment: None,
            ssh_key_type: None,
        }
    }

    /// Create a new player with SSH key information
    pub fn new_with_ssh_info(name: String, starting_room: &str, ssh_key_type: Option<String>, ssh_key_comment: Option<String>) -> Self {
        Player {
            name,
            current_room: starting_room.to_string(),
            inventory: Vec::new(),
            ssh_key_comment,
            ssh_key_type,
        }
    }

    pub fn name(&self) -> &str {
        &self.name
    }

    pub fn current_room(&self) -> &str {
        &self.current_room
    }

    pub fn set_current_room(&mut self, room_id: &str) {
        self.current_room = room_id.to_string();
    }

    pub fn add_to_inventory(&mut self, item: Item) {
        self.inventory.push(item);
    }

    pub fn inventory(&self) -> &Vec<Item> {
        &self.inventory
    }

    pub fn has_item(&self, item_name: &str) -> bool {
        self.inventory.iter().any(|i| i.name().to_lowercase() == item_name.to_lowercase())
    }

    pub fn take_from_inventory(&mut self, item_name: &str) -> Option<Item> {
        let pos = self.inventory.iter().position(|i| i.name().to_lowercase() == item_name.to_lowercase());
        if let Some(pos) = pos {
            Some(self.inventory.remove(pos))
        } else {
            None
        }
    }

    /// Get the SSH key comment if available
    pub fn ssh_key_comment(&self) -> Option<&String> {
        self.ssh_key_comment.as_ref()
    }

    /// Get the SSH key type if available
    pub fn ssh_key_type(&self) -> Option<&String> {
        self.ssh_key_type.as_ref()
    }

    /// Get a formatted display of the player's SSH key information
    pub fn ssh_info_display(&self) -> String {
        match (&self.ssh_key_type, &self.ssh_key_comment) {
            (Some(key_type), Some(comment)) => format!("{} ({})", comment, key_type),
            (Some(key_type), None) => format!("Unknown user ({})", key_type),
            (None, Some(comment)) => format!("{} (unknown key type)", comment),
            (None, None) => "Unknown user (no SSH key info)".to_string(),
        }
    }
}
