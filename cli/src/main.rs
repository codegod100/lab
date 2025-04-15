use clap::{Parser, ArgAction};
use colored::*;
use std::fs::{self, DirEntry};
use std::io;
use std::path::Path;
use chrono::{DateTime, Local};

#[derive(Parser)]
#[command(name = "lsd")]
#[command(author = "Augment Agent")]
#[command(version = "0.1.0")]
#[command(about = "A colorful clone of the ls command", long_about = None)]
struct Cli {
    /// Directory to list (defaults to current directory)
    #[arg(default_value = ".")]
    path: String,

    /// Show hidden files
    #[arg(short = 'a', long = "all", action = ArgAction::SetTrue)]
    all: bool,

    /// Use long listing format
    #[arg(short = 'l', long = "long", action = ArgAction::SetTrue)]
    long: bool,

    /// Show directory contents in a tree view
    #[arg(short = 't', long = "tree", action = ArgAction::SetTrue)]
    tree: bool,
}

fn main() -> io::Result<()> {
    let cli = Cli::parse();

    // Get the directory entries
    let entries = get_directory_entries(&cli.path, cli.all)?;

    // Display the entries
    if cli.tree {
        display_tree(&cli.path, cli.all, 0)?;
    } else if cli.long {
        display_long_format(&entries)?;
    } else {
        display_grid_format(&entries)?;
    }

    Ok(())
}

/// Get directory entries, optionally including hidden files
fn get_directory_entries(path: &str, show_hidden: bool) -> io::Result<Vec<DirEntry>> {
    let mut entries = Vec::new();

    for entry in fs::read_dir(path)? {
        let entry = entry?;
        let file_name = entry.file_name().to_string_lossy().to_string();

        // Skip hidden files if not showing them
        if !show_hidden && file_name.starts_with('.') {
            continue;
        }

        entries.push(entry);
    }

    // Sort entries by name
    entries.sort_by(|a, b| {
        let a_name = a.file_name().to_string_lossy().to_string();
        let b_name = b.file_name().to_string_lossy().to_string();
        a_name.cmp(&b_name)
    });

    Ok(entries)
}

/// Display entries in a grid format
fn display_grid_format(entries: &[DirEntry]) -> io::Result<()> {
    // Get terminal width
    let width = term_size::dimensions().map(|(w, _)| w).unwrap_or(80);

    // Calculate the maximum filename length
    let max_len = entries.iter()
        .map(|e| e.file_name().to_string_lossy().len() + 2) // +2 for icon and space
        .max()
        .unwrap_or(20);

    // Calculate how many columns we can fit
    let columns = width / max_len;
    let columns = if columns == 0 { 1 } else { columns };

    for (i, entry) in entries.iter().enumerate() {
        let file_name = entry.file_name().to_string_lossy().to_string();
        let colored_name = colorize_entry(entry, &file_name);

        print!("{}{}", get_icon(entry), colored_name);

        // Add padding to align columns
        let padding = max_len - file_name.len();
        print!("{:padding$}", "", padding = padding);

        // Start a new line after the last column or at the end
        if (i + 1) % columns == 0 || i == entries.len() - 1 {
            println!();
        }
    }

    Ok(())
}

/// Display entries in a long format (similar to ls -l)
fn display_long_format(entries: &[DirEntry]) -> io::Result<()> {
    for entry in entries {
        let metadata = entry.metadata()?;
        let file_name = entry.file_name().to_string_lossy().to_string();

        // Format file permissions
        let permissions = metadata.permissions();
        let perm_string = format_permissions(&permissions);

        // Format file size
        let size = format_size(metadata.len());

        // Format modification time
        let modified: DateTime<Local> = metadata.modified()?.into();
        let mod_time = modified.format("%b %d %H:%M").to_string();

        // Colorize the filename
        let colored_name = colorize_entry(entry, &file_name);

        println!("{} {:>8} {} {}{}",
                 perm_string.green(),
                 size.yellow(),
                 mod_time.blue(),
                 get_icon(entry),
                 colored_name);
    }

    Ok(())
}

/// Display directory contents in a tree view
fn display_tree(path: &str, show_hidden: bool, depth: usize) -> io::Result<()> {
    let entries = get_directory_entries(path, show_hidden)?;

    for entry in entries {
        let file_name = entry.file_name().to_string_lossy().to_string();
        let colored_name = colorize_entry(&entry, &file_name);

        // Print indentation based on depth
        for _ in 0..depth {
            print!("│   ");
        }

        println!("├── {}{}", get_icon(&entry), colored_name);

        // Recursively display subdirectories
        if entry.file_type()?.is_dir() {
            display_tree(&entry.path().to_string_lossy(), show_hidden, depth + 1)?;
        }
    }

    Ok(())
}

/// Format file permissions
fn format_permissions(permissions: &std::fs::Permissions) -> String {
    #[cfg(unix)]
    {
        use std::os::unix::fs::PermissionsExt;
        let mode = permissions.mode();
        let user = [(mode & 0o400) != 0, (mode & 0o200) != 0, (mode & 0o100) != 0];
        let group = [(mode & 0o040) != 0, (mode & 0o020) != 0, (mode & 0o010) != 0];
        let other = [(mode & 0o004) != 0, (mode & 0o002) != 0, (mode & 0o001) != 0];

        let to_rwx = |bits: [bool; 3]| {
            let r = if bits[0] { 'r' } else { '-' };
            let w = if bits[1] { 'w' } else { '-' };
            let x = if bits[2] { 'x' } else { '-' };
            format!("{}{}{}", r, w, x)
        };

        format!("{}{}{}", to_rwx(user), to_rwx(group), to_rwx(other))
    }

    #[cfg(not(unix))]
    {
        if permissions.readonly() {
            "r--r--r--".to_string()
        } else {
            "rw-rw-rw-".to_string()
        }
    }
}

/// Format file size to be human-readable
fn format_size(size: u64) -> String {
    const KB: u64 = 1024;
    const MB: u64 = KB * 1024;
    const GB: u64 = MB * 1024;

    if size < KB {
        format!("{} B", size)
    } else if size < MB {
        format!("{:.1} K", size as f64 / KB as f64)
    } else if size < GB {
        format!("{:.1} M", size as f64 / MB as f64)
    } else {
        format!("{:.1} G", size as f64 / GB as f64)
    }
}

/// Get an icon for a file or directory
fn get_icon(entry: &DirEntry) -> ColoredString {
    let file_type = match entry.file_type() {
        Ok(ft) => ft,
        Err(_) => return "📄 ".normal(), // Default icon if we can't determine file type
    };

    if file_type.is_dir() {
        "📁 ".blue()
    } else if file_type.is_symlink() {
        "🔗 ".cyan()
    } else {
        // Check file extension for specific icons
        let file_name = entry.file_name().to_string_lossy().to_string();
        if let Some(extension) = Path::new(&file_name).extension() {
            match extension.to_string_lossy().as_ref() {
                "rs" => "🦀 ".red(),
                "js" => "📜 ".yellow(),
                "py" => "🐍 ".blue(),
                "md" => "📝 ".white(),
                "jpg" | "png" | "gif" => "🖼️ ".magenta(),
                "mp3" | "wav" => "🎵 ".green(),
                "mp4" | "avi" | "mkv" => "🎬 ".yellow(),
                "pdf" => "📕 ".red(),
                "zip" | "tar" | "gz" => "📦 ".yellow(),
                "exe" | "sh" => "⚙️ ".green(),
                _ => "📄 ".normal(),
            }
        } else {
            "📄 ".normal()
        }
    }
}

/// Colorize a file or directory name
fn colorize_entry(entry: &DirEntry, name: &str) -> ColoredString {
    let file_type = match entry.file_type() {
        Ok(ft) => ft,
        Err(_) => return name.normal(), // Default color if we can't determine file type
    };

    if file_type.is_dir() {
        name.blue().bold()
    } else if file_type.is_symlink() {
        name.cyan().italic()
    } else {
        // Check if file is executable
        #[cfg(unix)]
        {
            use std::os::unix::fs::PermissionsExt;
            if let Ok(metadata) = entry.metadata() {
                let permissions = metadata.permissions();
                if permissions.mode() & 0o111 != 0 {
                    return name.green().bold();
                }
            }
        }

        // Check file extension for specific colors
        let name_str = name.to_string();
        if let Some(extension) = Path::new(&name_str).extension() {
            match extension.to_string_lossy().as_ref() {
                "rs" => name.red(),
                "js" => name.yellow(),
                "py" => name.blue(),
                "md" => name.white().bold(),
                "jpg" | "png" | "gif" => name.magenta(),
                "mp3" | "wav" => name.green(),
                "mp4" | "avi" | "mkv" => name.yellow(),
                "pdf" => name.red(),
                "zip" | "tar" | "gz" => name.yellow(),
                "exe" | "sh" => name.green().bold(),
                _ => name.normal(),
            }
        } else {
            name.normal()
        }
    }
}
