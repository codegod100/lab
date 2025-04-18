use serde::Serialize;
use sysinfo::{DiskExt, System, SystemExt};

#[derive(Serialize)]
pub struct DiskUsage {
    pub name: String,
    pub total: u64,
    pub available: u64,
    pub file_system: String,
}

#[tauri::command]
fn get_disks() -> Vec<DiskUsage> {
    let mut sys = System::new_all();
    sys.refresh_disks_list();
    sys.refresh_disks();
    sys.disks()
        .iter()
        .map(|disk| DiskUsage {
            name: disk.mount_point().to_string_lossy().to_string(),
            total: disk.total_space(),
            available: disk.available_space(),
            file_system: String::from_utf8_lossy(disk.file_system()).to_string(),
        })
        .collect()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![get_disks])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
