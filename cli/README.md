# lsd-clone

A colorful clone of the `ls` command written in Rust, providing enhanced directory listing with colors, icons, and various display formats.

## Features

- **Colorful Output**: Files and directories are displayed with different colors based on their type
- **Icons**: Shows intuitive icons for different file types and directories
- **Multiple Display Formats**:
  - Standard grid view (default)
  - Long format (`-l`) with permissions, size, and modification time
  - Tree view (`-t`) to visualize directory structure
- **Hidden Files**: Option to show hidden files (`-a`)
- **Human-Readable Sizes**: File sizes are displayed in a human-readable format (B, K, M, G)

## Installation

### Prerequisites

- Rust and Cargo (latest stable version recommended)

### Building from Source

```bash
# Clone the repository
git clone https://github.com/yourusername/lsd-clone.git
cd lsd-clone

# Build the project
cargo build --release

# The binary will be available at target/release/lsd-clone
```

## Usage

```bash
# Basic usage (list current directory)
lsd-clone

# List a specific directory
lsd-clone /path/to/directory

# Show hidden files
lsd-clone -a

# Use long listing format
lsd-clone -l

# Show directory contents in a tree view
lsd-clone -t

# Combine options
lsd-clone -la /path/to/directory
```

### Command-line Options

```
Usage: lsd-clone [OPTIONS] [PATH]

Arguments:
  [PATH]  Directory to list (defaults to current directory) [default: .]

Options:
  -a, --all      Show hidden files
  -l, --long     Use long listing format
  -t, --tree     Show directory contents in a tree view
  -h, --help     Print help
  -V, --version  Print version
```

## Examples

### Standard View
```
📄 Cargo.lock  📄 Cargo.toml  📁 src  📁 target
```

### Long Format View
```
rw-r--r--   14.2 K Apr 14 22:47 📄 Cargo.lock
rw-r--r--    240 B Apr 14 22:45 📄 Cargo.toml
rwxr-xr-x     14 B Apr 14 22:41 📁 src
rwxr-xr-x     66 B Apr 14 22:47 📁 target
```

### Tree View
```
├── 📄 Cargo.lock
├── 📄 Cargo.toml
├── 📁 src
│   ├── 📄 main.rs
├── 📁 target
│   ├── 📁 debug
│   │   ├── ...
```

## Dependencies

- [clap](https://crates.io/crates/clap) - Command line argument parsing
- [colored](https://crates.io/crates/colored) - Terminal colors
- [chrono](https://crates.io/crates/chrono) - Date and time handling
- [term_size](https://crates.io/crates/term_size) - Terminal size detection

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
