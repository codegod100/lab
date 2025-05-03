use std::path::{Path, PathBuf};
use std::fs::{read_dir, metadata};
use serde::Serialize;

#[derive(Serialize)]
struct FileEntry {
    name: String,
    path: String,
    file_type: String,
    size: u64,
    modified: Option<u64>,
}

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn list_directory_async(path: String) -> Result<Vec<FileEntry>, String> {
    let path = Path::new(&path);
    let mut entries = Vec::new();
    for entry in read_dir(path).map_err(|e| e.to_string())? {
        let entry = entry.map_err(|e| e.to_string())?;
        let file_path = entry.path();
        let name = file_path.file_name()
            .map(|n| n.to_string_lossy().to_string())
            .unwrap_or_default();
        let meta = entry.metadata().map_err(|e| e.to_string())?;
        let file_type = if meta.is_dir() { "Directory" } else { "File" }.to_string();
        let size = if meta.is_file() { meta.len() } else { 0 };
        let modified = meta.modified().ok()
            .and_then(|mtime| mtime.duration_since(std::time::UNIX_EPOCH).ok())
            .map(|d| d.as_secs());
        entries.push(FileEntry {
            name,
            path: file_path.display().to_string(),
            file_type,
            size,
            modified,
        });
    }
    entries.sort_by(|a, b| a.name.cmp(&b.name));
    Ok(entries)
}

#[tauri::command]
fn get_file_metadata_async(path: String) -> Result<(u64, bool), String> {
    let metadata = metadata(&path).map_err(|e| e.to_string())?;
    Ok((metadata.len(), metadata.is_dir()))
}

#[tauri::command]
fn list_directory(path: String) -> Result<Vec<PathBuf>, String> {
    list_directory_async(path)
        .map(|entries| entries.into_iter().map(|entry| PathBuf::from(entry.path)).collect())
}

#[tauri::command]
fn get_parent_directory(path: String) -> Result<PathBuf, String> {
    let path = Path::new(&path);
    path.parent()
        .map(|p| p.to_path_buf())
        .ok_or_else(|| "No parent directory found".to_string())
}

#[tauri::command]
fn create_directory(path: String) -> Result<(), String> {
    std::fs::create_dir_all(&path).map_err(|e| e.to_string())
}

#[tauri::command]
fn rename_item(old_path: String, new_path: String) -> Result<(), String> {
    std::fs::rename(&old_path, &new_path).map_err(|e| e.to_string())
}

#[tauri::command]
fn delete_item(path: String) -> Result<(), String> {
    std::fs::remove_file(&path).map_err(|e| e.to_string())
}

#[tauri::command]
fn copy_item(src_path: String, dest_path: String) -> Result<(), String> {
    std::fs::copy(&src_path, &dest_path).map(|_| ()).map_err(|e| e.to_string())
}

#[tauri::command]
fn get_home_dir() -> Result<PathBuf, String> {
    dirs::home_dir().ok_or_else(|| "Could not find home directory".to_string())
}

#[tauri::command]
fn get_drives() -> Result<Vec<PathBuf>, String> {
    Ok(vec![Path::new("/").to_path_buf()])
}

#[tauri::command]
fn get_file_content(path: String) -> Result<String, String> {
    std::fs::read_to_string(&path).map_err(|e| e.to_string())
}

#[tauri::command]
fn get_platform() -> String {
    std::env::consts::OS.to_string()
}

#[tauri::command]
fn copy_paths_to_clipboard(paths: Vec<String>) -> Result<(), String> {
    Ok(())
}

#[tauri::command]
fn open_item(path: String) -> Result<(), String> {
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_clipboard::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            list_directory,
            get_parent_directory,
            create_directory,
            rename_item,
            delete_item,
            copy_item,
            get_home_dir,
            get_drives,
            get_file_content,
            get_platform,
            copy_paths_to_clipboard,
            open_item,
            list_directory_async,
            get_file_metadata_async,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
