/// Terminal formatting utilities

/// Format a room title
pub fn format_room_title(title: &str) -> String {
    format!("\r\n{}\r\n", title.to_uppercase())
}

/// Format a room description
pub fn format_room_description(description: &str) -> String {
    format!("{}\r\n", description)
}

/// Format exits
pub fn format_exits(exits: &[String]) -> String {
    if exits.is_empty() {
        return String::new();
    }

    format!("\r\nExits: {}\r\n", exits.join(", "))
}

/// Format items
pub fn format_items(items: &[String]) -> String {
    if items.is_empty() {
        return String::new();
    }

    let mut result = String::from("\r\nYou can see:");
    for item in items {
        result.push_str(&format!("\r\n- {}", item));
    }
    result
}

/// Format inventory title
pub fn format_inventory_title() -> String {
    String::from("\r\nINVENTORY\r\n")
}

/// Format inventory items
pub fn format_inventory_items(items: &[String]) -> String {
    if items.is_empty() {
        return String::from("Your inventory is empty.");
    }

    let mut result = String::new();
    for item in items {
        result.push_str(&format!("\r\n- {}", item));
    }
    result
}

/// Format item examination
pub fn format_item_examination(name: &str, description: &str) -> String {
    format!("\r\n{}\r\n{}", name.to_uppercase(), description)
}

/// Format help text
pub fn format_help_text() -> String {
    String::from(r#"
HELP COMMANDS

- look (l)           Look around the current room
- go [direction]     Move in a direction
                    (north/n, south/s, east/e, west/w, up/u, down/d)
- take [item]        Take an item (also: get)
- drop [item]        Drop an item from your inventory
- inventory (inv, i) Show your inventory
- examine [item] (x) Examine an item in detail
- help (?)           Show this help message
- quit or exit       Leave the game

Type just the direction (e.g., 'north') as a shortcut to go that way.
"#.replace("\n", "\r\n"))
}

/// Format welcome message
pub fn format_welcome_message(player_name: &str) -> String {
    format!(r#"
WELCOME TO THE TEXT ADVENTURE

You are logged in as: {}

You find yourself at the entrance of a mysterious cave.
Type 'look' to see your surroundings.
Type 'help' for a list of commands.

"#, player_name).replace("\n", "\r\n")
}

/// Format prompt
pub fn format_prompt() -> String {
    String::from("\r\n> ")
}
