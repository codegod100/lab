use std::collections::HashMap;
use anyhow::Result;
use serde::{Serialize, Deserialize};

/// Represents an item in the game world
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Item {
    name: String,
    description: String,
    takeable: bool,
    use_message: Option<String>,
}

impl Item {
    pub fn new(name: &str, description: &str, takeable: bool) -> Self {
        Item {
            name: name.to_string(),
            description: description.to_string(),
            takeable,
            use_message: None,
        }
    }

    pub fn with_use_message(name: &str, description: &str, takeable: bool, use_message: &str) -> Self {
        Item {
            name: name.to_string(),
            description: description.to_string(),
            takeable,
            use_message: Some(use_message.to_string()),
        }
    }

    pub fn name(&self) -> &str {
        &self.name
    }

    pub fn description(&self) -> &str {
        &self.description
    }

    pub fn is_takeable(&self) -> bool {
        self.takeable
    }

    pub fn use_message(&self) -> Option<&String> {
        self.use_message.as_ref()
    }

    pub fn can_use(&self) -> bool {
        self.use_message.is_some()
    }
}

/// Represents a room in the game world
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Room {
    id: String,
    name: String,
    description: String,
    exits: HashMap<String, String>, // direction -> room_id
    items: Vec<Item>,
}

impl Room {
    pub fn new(id: &str, name: &str, description: &str) -> Self {
        Room {
            id: id.to_string(),
            name: name.to_string(),
            description: description.to_string(),
            exits: HashMap::new(),
            items: Vec::new(),
        }
    }

    pub fn id(&self) -> &str {
        &self.id
    }

    pub fn name(&self) -> &str {
        &self.name
    }

    pub fn description(&self) -> &str {
        &self.description
    }

    pub fn add_exit(&mut self, direction: &str, room_id: &str) {
        self.exits.insert(direction.to_string(), room_id.to_string());
    }

    pub fn exits(&self) -> &HashMap<String, String> {
        &self.exits
    }

    pub fn add_item(&mut self, item: Item) {
        self.items.push(item);
    }

    pub fn items(&self) -> &Vec<Item> {
        &self.items
    }

    pub fn items_mut(&mut self) -> &mut Vec<Item> {
        &mut self.items
    }

    pub fn take_item(&mut self, item_name: &str) -> Option<Item> {
        let pos = self.items.iter().position(|i| i.name().to_lowercase() == item_name.to_lowercase() && i.is_takeable());
        if let Some(pos) = pos {
            Some(self.items.remove(pos))
        } else {
            None
        }
    }
}

/// Represents the entire game world
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct World {
    rooms: HashMap<String, Room>,
    starting_room: String,
}

impl World {
    pub fn new(starting_room: &str) -> Self {
        World {
            rooms: HashMap::new(),
            starting_room: starting_room.to_string(),
        }
    }

    pub fn add_room(&mut self, room: Room) {
        self.rooms.insert(room.id().to_string(), room);
    }

    pub fn get_room(&self, room_id: &str) -> Option<&Room> {
        self.rooms.get(room_id)
    }

    pub fn get_room_mut(&mut self, room_id: &str) -> Option<&mut Room> {
        self.rooms.get_mut(room_id)
    }

    pub fn starting_room_id(&self) -> &str {
        &self.starting_room
    }

    pub fn move_player(&self, current_room_id: &str, direction: &str) -> Result<&str> {
        let room = self.get_room(current_room_id)
            .ok_or_else(|| anyhow::anyhow!("Current room not found"))?;

        let next_room_id = room.exits().get(direction)
            .ok_or_else(|| anyhow::anyhow!("You can't go that way"))?;

        Ok(next_room_id)
    }
}
