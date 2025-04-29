use anyhow::Result;

use super::player::Player;
use super::world::World;
use crate::terminal;

/// Represents a command in the game
#[derive(Debug, Clone)]
pub enum Command {
    Look,
    Go(String),
    Take(String),
    Drop(String),
    Inventory,
    Examine(String),
    Use(String),
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
            "use" => {
                if parts.len() < 2 {
                    Command::Unknown("Use what?".to_string())
                } else {
                    Command::Use(parts[1..].join(" "))
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

                // Use the terminal formatting module
                let title = room.name();
                let mut output = crate::terminal::format_room_title(title);
                output.push_str(&crate::terminal::format_room_description(room.description()));

                // Format exits
                let exits = room.exits();
                let exit_names: Vec<String> = exits.keys().map(|k| k.to_string()).collect();
                output.push_str(&crate::terminal::format_exits(&exit_names));

                // Format items
                let items = room.items();
                let item_names: Vec<String> = items.iter().map(|i| i.name().to_string()).collect();
                output.push_str(&crate::terminal::format_items(&item_names));

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

                        // Create a simple movement message
                        let mut output = format!("\nYou go {}.\n", direction);

                        // Use the terminal formatting module
                        let title = room.name();
                        output.push_str(&crate::terminal::format_room_title(title));
                        output.push_str(&crate::terminal::format_room_description(room.description()));

                        // Format exits
                        let exits = room.exits();
                        let exit_names: Vec<String> = exits.keys().map(|k| k.to_string()).collect();
                        output.push_str(&crate::terminal::format_exits(&exit_names));

                        // Format items
                        let items = room.items();
                        let item_names: Vec<String> = items.iter().map(|i| i.name().to_string()).collect();
                        output.push_str(&crate::terminal::format_items(&item_names));

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
                        Ok(format!("\nYou take the {}.", item_name))
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

                Ok(format!("\nYou drop the {}.", item_name))
            },
            Command::Inventory => {
                let inventory = player.inventory();

                // Use the terminal formatting module
                let mut output = crate::terminal::format_inventory_title();

                // Format inventory items
                let item_names: Vec<String> = inventory.iter().map(|i| i.name().to_string()).collect();
                output.push_str(&crate::terminal::format_inventory_items(&item_names));

                Ok(output)
            },
            Command::Examine(item_name) => {
                // Check if the item is in the player's inventory
                let inventory = player.inventory();
                if let Some(item) = inventory.iter().find(|i| i.name().to_lowercase() == item_name.to_lowercase()) {
                    let name = item.name();
                    let desc = item.description();
                    return Ok(crate::terminal::format_item_examination(name, desc));
                }

                // Check if the item is in the room
                let room_id = player.current_room();
                let room = world.get_room(room_id)
                    .ok_or_else(|| anyhow::anyhow!("Room not found"))?;

                if let Some(item) = room.items().iter().find(|i| i.name().to_lowercase() == item_name.to_lowercase()) {
                    let name = item.name();
                    let desc = item.description();
                    Ok(crate::terminal::format_item_examination(name, desc))
                } else {
                    Err(anyhow::anyhow!("You don't see that here."))
                }
            },
            Command::Use(item_name) => {
                // First check if the item is in the player's inventory
                let inventory = player.inventory();
                if let Some(item) = inventory.iter().find(|i| i.name().to_lowercase() == item_name.to_lowercase()) {
                    if let Some(use_message) = item.use_message() {
                        return Ok(format!("\n{}", use_message));
                    } else {
                        return Ok(format!("\nYou can't figure out how to use the {}.", item.name()));
                    }
                }

                // Then check if the item is in the room
                let room_id = player.current_room();
                let room = world.get_room(room_id)
                    .ok_or_else(|| anyhow::anyhow!("Room not found"))?;

                if let Some(item) = room.items().iter().find(|i| i.name().to_lowercase() == item_name.to_lowercase()) {
                    if let Some(use_message) = item.use_message() {
                        Ok(format!("\n{}", use_message))
                    } else {
                        Ok(format!("\nYou can't figure out how to use the {}.", item.name()))
                    }
                } else {
                    Err(anyhow::anyhow!("You don't see that here."))
                }
            },
            Command::Help => {
                Ok(crate::terminal::format_help_text())
            },
            Command::Unknown(input) => {
                if input.is_empty() {
                    Ok("\nType 'help' for a list of commands.".to_string())
                } else {
                    Ok(format!("\nI don't understand '{}'.\nType 'help' for a list of commands.", input))
                }
            },
        }
    }
}
