use std::fs;
use std::path::Path;
use serde::{Serialize, Deserialize};
use std::time::SystemTime;
use tauri::command;
use tauri::async_runtime;
use std::process::Command;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum FileType {
    File,
    Directory,
    Symlink,
    Other,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct FileItem {
    pub name: String,
    pub path: String,
    pub file_type: FileType,
    pub size: u64,
    pub modified: Option<u64>,
    pub created: Option<u64>,
    pub is_hidden: bool,
}

#[command]
pub async fn list_directory(path: &str) -> Result<Vec<FileItem>, String> {
    let path = path.to_string();
    async_runtime::spawn_blocking(move || {
        let path = Path::new(&path);

        if !path.exists() {
            return Err(format!("Path does not exist: {}", path.display()));
        }

        if !path.is_dir() {
            return Err(format!("Path is not a directory: {}", path.display()));
        }

        let entries = match fs::read_dir(path) {
            Ok(entries) => entries,
            Err(e) => return Err(format!("Failed to read directory: {}", e)),
        };

        let mut items = Vec::new();
        let mut count = 0;
        let max_entries = 500; // Lowered for safety

        for entry in entries {
            if count >= max_entries {
                break;
            }
            if let Ok(entry) = entry {
                let file_name = entry.file_name();
                let file_name = file_name.to_string_lossy().to_string();
                let is_hidden = file_name.starts_with(".");
                let path_str = entry.path().to_string_lossy().to_string();
                let metadata = match entry.metadata() {
                    Ok(meta) => meta,
                    Err(_) => continue,
                };
                let file_type = if metadata.is_dir() {
                    FileType::Directory
                } else if metadata.is_file() {
                    FileType::File
                } else if metadata.file_type().is_symlink() {
                    FileType::Symlink
                } else {
                    FileType::Other
                };
                let size = metadata.len();
                let modified = metadata.modified().ok()
                    .and_then(|time| time.duration_since(SystemTime::UNIX_EPOCH).ok())
                    .map(|duration| duration.as_secs());
                let created = metadata.created().ok()
                    .and_then(|time| time.duration_since(SystemTime::UNIX_EPOCH).ok())
                    .map(|duration| duration.as_secs());
                items.push(FileItem {
                    name: file_name,
                    path: path_str,
                    file_type,
                    size,
                    modified,
                    created,
                    is_hidden,
                });
                count += 1;
            }
        }

        if count >= max_entries {
            eprintln!("Warning: Directory listing truncated at {} entries", max_entries);
        }

        Ok(items)
    }).await.unwrap()
}

#[command]
pub fn get_parent_directory(path: &str) -> Result<String, String> {
    let path = Path::new(path);

    if let Some(parent) = path.parent() {
        Ok(parent.to_string_lossy().to_string())
    } else {
        Err("No parent directory".to_string())
    }
}

#[command]
pub fn create_directory(path: &str) -> Result<(), String> {
    match fs::create_dir_all(path) {
        Ok(_) => Ok(()),
        Err(e) => Err(format!("Failed to create directory: {}", e)),
    }
}

#[command]
pub fn rename_item(from: &str, to: &str) -> Result<(), String> {
    match fs::rename(from, to) {
        Ok(_) => Ok(()),
        Err(e) => Err(format!("Failed to rename: {}", e)),
    }
}

#[command]
pub fn delete_item(path: &str, recursive: bool) -> Result<(), String> {
    let path = Path::new(path);

    if !path.exists() {
        return Err(format!("Path does not exist: {}", path.display()));
    }

    if path.is_dir() {
        if recursive {
            match fs::remove_dir_all(path) {
                Ok(_) => Ok(()),
                Err(e) => Err(format!("Failed to delete directory: {}", e)),
            }
        } else {
            match fs::remove_dir(path) {
                Ok(_) => Ok(()),
                Err(e) => Err(format!("Failed to delete directory: {}", e)),
            }
        }
    } else {
        match fs::remove_file(path) {
            Ok(_) => Ok(()),
            Err(e) => Err(format!("Failed to delete file: {}", e)),
        }
    }
}

#[command]
pub fn copy_item(from: &str, to: &str) -> Result<(), String> {
    let from_path = Path::new(from);
    let to_path = Path::new(to);

    if !from_path.exists() {
        return Err(format!("Source path does not exist: {}", from_path.display()));
    }

    if from_path.is_dir() {
        copy_dir_recursive(from_path, to_path, 0, 10)
    } else {
        match fs::copy(from_path, to_path) {
            Ok(_) => Ok(()),
            Err(e) => Err(format!("Failed to copy file: {}", e)),
        }
    }
}

pub fn copy_dir_recursive(from: &Path, to: &Path, depth: usize, max_depth: usize) -> Result<(), String> {
    if depth > max_depth {
        return Err(format!("Maximum recursion depth ({}) reached", max_depth));
    }
    if !to.exists() {
        match fs::create_dir_all(to) {
            Ok(_) => {},
            Err(e) => return Err(format!("Failed to create directory: {}", e)),
        }
    }
    let entries = match fs::read_dir(from) {
        Ok(entries) => entries,
        Err(e) => return Err(format!("Failed to read directory: {}", e)),
    };
    let mut count = 0;
    let max_entries = 500; // Lowered for safety
    for entry in entries {
        if count >= max_entries {
            break;
        }
        if let Ok(entry) = entry {
            let from_path = entry.path();
            let to_path = to.join(entry.file_name());
            if from_path.is_dir() {
                copy_dir_recursive(&from_path, &to_path, depth + 1, max_depth)?;
            } else {
                match fs::copy(&from_path, &to_path) {
                    Ok(_) => {},
                    Err(e) => return Err(format!("Failed to copy file: {}", e)),
                }
            }
            count += 1;
        }
    }
    if count >= max_entries {
        eprintln!("Warning: Directory copy truncated at {} entries", max_entries);
    }
    Ok(())
}

#[command]
pub async fn copy_directory_command(from: String, to: String) -> Result<(), String> {
    async_runtime::spawn_blocking(move || {
        let max_depth = 10; // Limit recursion depth
        let from_path = Path::new(&from);
        let to_path = Path::new(&to);
        copy_dir_recursive(from_path, to_path, 0, max_depth)
    }).await.unwrap()
}

#[command]
pub async fn get_file_content(path: &str, max_size: Option<u64>) -> Result<String, String> {
    let path = path.to_string();
    async_runtime::spawn_blocking(move || {
        let path = Path::new(&path);

        if !path.exists() {
            return Err(format!("Path does not exist: {}", path.display()));
        }

        if !path.is_file() {
            return Err(format!("Path is not a file: {}", path.display()));
        }

        let metadata = match fs::metadata(path) {
            Ok(meta) => meta,
            Err(e) => return Err(format!("Failed to get metadata: {}", e)),
        };

        let size = metadata.len();
        let max_allowed = max_size.unwrap_or(1024 * 1024 * 2); // 2 MB cap
        if size > max_allowed {
            return Err(format!("File too large: {} bytes (max: {} bytes)", size, max_allowed));
        }

        match fs::read_to_string(path) {
            Ok(content) => Ok(content),
            Err(e) => Err(format!("Failed to read file: {}", e)),
        }
    }).await.unwrap()
}

#[command]
pub fn get_home_dir() -> Result<String, String> {
    match dirs::home_dir() {
        Some(path) => Ok(path.to_string_lossy().to_string()),
        None => Err("Could not determine home directory".to_string()),
    }
}

#[command]
pub fn get_drives() -> Result<Vec<String>, String> {
    #[cfg(target_os = "windows")]
    {
        use std::process::Command;

        let output = Command::new("wmic")
            .args(&["logicaldisk", "get", "name"])
            .output()
            .map_err(|e| format!("Failed to execute command: {}", e))?;

        let output_str = String::from_utf8_lossy(&output.stdout);
        let drives: Vec<String> = output_str
            .lines()
            .skip(1) // Skip header
            .filter_map(|line| {
                let drive = line.trim();
                if !drive.is_empty() {
                    Some(format!("{}\\", drive))
                } else {
                    None
                }
            })
            .collect();

        Ok(drives)
    }

    #[cfg(not(target_os = "windows"))]
    {
        // On Unix-like systems, just return root
        Ok(vec!["/".to_string()])
    }
}

#[command]
pub fn get_platform() -> String {
    #[cfg(target_os = "windows")]
    {
        "windows".to_string()
    }

    #[cfg(target_os = "macos")]
    {
        "macos".to_string()
    }

    #[cfg(target_os = "linux")]
    {
        "linux".to_string()
    }

    #[cfg(not(any(target_os = "windows", target_os = "macos", target_os = "linux")))]
    {
        "unknown".to_string()
    }
}

#[command]
pub fn copy_paths_to_clipboard(paths: Vec<String>) -> Result<(), String> {
    // Format paths for the clipboard
    let formatted_paths = paths.join("\n");

    // Use the standard library to write to the clipboard
    // This is a simplified implementation that just returns success
    // In a real implementation, you would use a platform-specific clipboard API
    println!("Would copy to clipboard: {}", formatted_paths);

    // For now, just return success
    // The actual clipboard operation will be handled by the frontend
    Ok(())
}

#[command]
pub fn open_item(path: &str) -> Result<(), String> {
    // Platform-specific open
    #[cfg(target_os = "windows")]
    {
        Command::new("cmd")
            .args(["/C", "start", "", path])
            .spawn()
            .map_err(|e| format!("Failed to open file: {}", e))?;
    }
    #[cfg(target_os = "macos")]
    {
        Command::new("open")
            .arg(path)
            .spawn()
            .map_err(|e| format!("Failed to open file: {}", e))?;
    }
    #[cfg(target_os = "linux")]
    {
        Command::new("xdg-open")
            .arg(path)
            .spawn()
            .map_err(|e| format!("Failed to open file: {}", e))?;
    }
    Ok(())
}
