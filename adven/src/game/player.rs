use serde::{Serialize, Deserialize};

use super::world::Item;

/// Represents a player in the game
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Player {
    name: String,
    current_room: String,
    inventory: Vec<Item>,
}

impl Player {
    pub fn new(name: String, starting_room: &str) -> Self {
        Player {
            name,
            current_room: starting_room.to_string(),
            inventory: Vec::new(),
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
}
