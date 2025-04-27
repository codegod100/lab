use anyhow::Result;

use super::player::Player;
use super::world::World;

/// Represents a command in the game
#[derive(Debug, Clone)]
pub enum Command {
    Look,
    Go(String),
    Take(String),
    Drop(String),
    Inventory,
    Examine(String),
    Help,
    Unknown(String),
}

impl Command {
    /// Parse a string input into a Command
    pub fn parse(input: &str) -> Self {
        let input = input.trim().to_lowercase();
        let parts: Vec<&str> = input.split_whitespace().collect();
        
        if parts.is_empty() {
            return Command::Unknown("".to_string());
        }
        
        match parts[0] {
            "look" | "l" => Command::Look,
            "go" | "move" | "walk" => {
                if parts.len() < 2 {
                    Command::Unknown("Go where?".to_string())
                } else {
                    Command::Go(parts[1].to_string())
                }
            },
            "north" | "n" => Command::Go("north".to_string()),
            "south" | "s" => Command::Go("south".to_string()),
            "east" | "e" => Command::Go("east".to_string()),
            "west" | "w" => Command::Go("west".to_string()),
            "up" | "u" => Command::Go("up".to_string()),
            "down" | "d" => Command::Go("down".to_string()),
            "take" | "get" | "pickup" => {
                if parts.len() < 2 {
                    Command::Unknown("Take what?".to_string())
                } else {
                    Command::Take(parts[1..].join(" "))
                }
            },
            "drop" => {
                if parts.len() < 2 {
                    Command::Unknown("Drop what?".to_string())
                } else {
                    Command::Drop(parts[1..].join(" "))
                }
            },
            "inventory" | "inv" | "i" => Command::Inventory,
            "examine" | "x" | "look at" => {
                if parts.len() < 2 {
                    Command::Unknown("Examine what?".to_string())
                } else {
                    Command::Examine(parts[1..].join(" "))
                }
            },
            "help" | "?" => Command::Help,
            _ => Command::Unknown(input),
        }
    }
    
    /// Execute the command and return the result
    pub fn execute(&self, player: &mut Player, world: &mut World) -> Result<String> {
        match self {
            Command::Look => {
                let room_id = player.current_room();
                let room = world.get_room(room_id)
                    .ok_or_else(|| anyhow::anyhow!("Room not found"))?;
                
                let mut output = format!("\n== {} ==\n\n{}\n", room.name(), room.description());
                
                // Add exits
                let exits = room.exits();
                if !exits.is_empty() {
                    output.push_str("\nExits: ");
                    output.push_str(&exits.keys().map(|k| k.to_string()).collect::<Vec<_>>().join(", "));
                }
                
                // Add items in the room
                let items = room.items();
                if !items.is_empty() {
                    output.push_str("\n\nYou can see: ");
                    output.push_str(&items.iter().map(|i| i.name().to_string()).collect::<Vec<_>>().join(", "));
                }
                
                Ok(output)
            },
            Command::Go(direction) => {
                let current_room = player.current_room();
                match world.move_player(current_room, direction) {
                    Ok(new_room_id) => {
                        player.set_current_room(new_room_id);
                        
                        // Return the description of the new room
                        let room = world.get_room(new_room_id)
                            .ok_or_else(|| anyhow::anyhow!("New room not found"))?;
                        
                        let mut output = format!("\nYou go {}.\n\n== {} ==\n\n{}\n", direction, room.name(), room.description());
                        
                        // Add exits
                        let exits = room.exits();
                        if !exits.is_empty() {
                            output.push_str("\nExits: ");
                            output.push_str(&exits.keys().map(|k| k.to_string()).collect::<Vec<_>>().join(", "));
                        }
                        
                        // Add items in the room
                        let items = room.items();
                        if !items.is_empty() {
                            output.push_str("\n\nYou can see: ");
                            output.push_str(&items.iter().map(|i| i.name().to_string()).collect::<Vec<_>>().join(", "));
                        }
                        
                        Ok(output)
                    },
                    Err(e) => Err(e),
                }
            },
            Command::Take(item_name) => {
                let room_id = player.current_room();
                let room = world.get_room_mut(room_id)
                    .ok_or_else(|| anyhow::anyhow!("Room not found"))?;
                
                match room.take_item(item_name) {
                    Some(item) => {
                        let item_name = item.name().to_string();
                        player.add_to_inventory(item);
                        Ok(format!("You take the {}.", item_name))
                    },
                    None => Err(anyhow::anyhow!("You don't see that here.")),
                }
            },
            Command::Drop(item_name) => {
                let item = player.take_from_inventory(item_name)
                    .ok_or_else(|| anyhow::anyhow!("You don't have that."))?;
                
                let room_id = player.current_room();
                let room = world.get_room_mut(room_id)
                    .ok_or_else(|| anyhow::anyhow!("Room not found"))?;
                
                let item_name = item.name().to_string();
                room.add_item(item);
                
                Ok(format!("You drop the {}.", item_name))
            },
            Command::Inventory => {
                let inventory = player.inventory();
                if inventory.is_empty() {
                    Ok("Your inventory is empty.".to_string())
                } else {
                    let items = inventory.iter()
                        .map(|i| i.name().to_string())
                        .collect::<Vec<_>>()
                        .join(", ");
                    
                    Ok(format!("You are carrying: {}", items))
                }
            },
            Command::Examine(item_name) => {
                // Check if the item is in the player's inventory
                let inventory = player.inventory();
                if let Some(item) = inventory.iter().find(|i| i.name().to_lowercase() == item_name.to_lowercase()) {
                    return Ok(format!("{}: {}", item.name(), item.description()));
                }
                
                // Check if the item is in the room
                let room_id = player.current_room();
                let room = world.get_room(room_id)
                    .ok_or_else(|| anyhow::anyhow!("Room not found"))?;
                
                if let Some(item) = room.items().iter().find(|i| i.name().to_lowercase() == item_name.to_lowercase()) {
                    Ok(format!("{}: {}", item.name(), item.description()))
                } else {
                    Err(anyhow::anyhow!("You don't see that here."))
                }
            },
            Command::Help => {
                Ok(r#"Available commands:
- look (l): Look around
- go [direction] (or just type the direction): Move in a direction (north/n, south/s, east/e, west/w, up/u, down/d)
- take [item] (get): Take an item
- drop [item]: Drop an item
- inventory (inv, i): Show your inventory
- examine [item] (x): Examine an item
- help (?): Show this help message"#.to_string())
            },
            Command::Unknown(input) => {
                if input.is_empty() {
                    Ok("Type 'help' for a list of commands.".to_string())
                } else {
                    Ok(format!("I don't understand '{}'.\nType 'help' for a list of commands.", input))
                }
            },
        }
    }
}
