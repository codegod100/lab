# Text Adventure Game Server

A text adventure game server with built-in SSH server for secure connections.

## Features

- Text-based adventure game with rooms, items, and commands
- Built-in SSH server for secure connections
- Support for key-based authentication
- Multi-player support

## Getting Started

### Running the Server

1. Clone the repository
2. Build the project:
   ```
   cargo build --release
   ```
3. Run the server:
   ```
   cargo run --release
   ```

The server will start on port 3333 by default.

### Connecting to the Game

Connect to the game using SSH:

```
ssh -p 3333 username@localhost
```

Replace `username` with any username you prefer. The server accepts any SSH key for authentication.

**Note:** Password authentication is disabled for security reasons. You must use SSH key-based authentication.

### Setting Up SSH Keys

If you don't have an SSH key yet:

1. Generate an SSH key pair:
   ```
   ssh-keygen -t ed25519
   ```

2. Connect to the server using your SSH key:
   ```
   ssh -p 3333 username@localhost
   ```

The server will automatically generate its own host key on first run, which is stored in the `ssh_host_key` file.

### Game Commands

Once connected, you can use the following commands:

- `look` - Look around the current room
- `go <direction>` - Move in a direction (north, south, east, west)
- `take <item>` - Pick up an item
- `drop <item>` - Drop an item from your inventory
- `inventory` - Show your inventory
- `examine <item>` - Examine an item
- `help` - Show available commands
- `quit` or `exit` - Exit the game

## Security Features

The game server includes several security features:

1. **SSH Protocol**: All communications are encrypted using the SSH protocol
2. **Key-Based Authentication**: Only SSH key authentication is allowed (passwords are rejected)
3. **Ed25519 Keys**: The server uses modern Ed25519 keys for strong security
4. **No External Dependencies**: The SSH server is built directly into the game, no external SSH server required

## Technical Details

This project implements its own SSH server using the `russh` crate, which provides:

- Full SSH protocol implementation
- Key-based authentication
- Secure encrypted communications
- Session management

The SSH server is integrated directly with the game logic, allowing players to connect securely without any additional setup.

## Development

This project is built with Rust and uses the following libraries:

- `tokio` - Asynchronous runtime
- `russh` - SSH server implementation
- `anyhow` - Error handling
- `serde` - Serialization/deserialization

### Future Enhancements

- Support for authorized_keys files to restrict access
- User accounts with persistent game state
- Support for multiple simultaneous game worlds
- Admin commands for server management

To contribute, please fork the repository and submit a pull request.
