use serde::Serialize;
use sysinfo::{CpuExt, DiskExt, PidExt, ProcessExt, System, SystemExt};
use std::{thread, time::Duration};
use once_cell::sync::Lazy;
use std::sync::Mutex;

#[derive(Serialize)]
pub struct DiskUsage {
    pub name: String,
    pub total: u64,
    pub available: u64,
    pub file_system: String,
}

#[derive(Serialize)]
pub struct ProcessInfo {
    pub name: String,
    pub pid: i32,
    pub cpu_usage: f32,
    pub memory: u64,
}

#[derive(Serialize)]
pub struct SystemStats {
    pub cpu_usage: f32,
    pub total_memory: u64,
    pub used_memory: u64,
    pub top_processes: Vec<ProcessInfo>,
    pub top_mem_processes: Vec<ProcessInfo>,
}

static SYS: Lazy<Mutex<System>> = Lazy::new(|| Mutex::new(System::new_all()));

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

#[tauri::command]
fn get_system_stats() -> SystemStats {
    let mut sys = SYS.lock().unwrap();
    sys.refresh_cpu();
    sys.refresh_memory();
    sys.refresh_processes();
    thread::sleep(Duration::from_millis(150));
    sys.refresh_cpu();
    sys.refresh_processes();
    let cpu_usage = sys.global_cpu_info().cpu_usage();
    let total_memory = sys.total_memory();
    let used_memory = sys.used_memory();
    let mut processes: Vec<_> = sys.processes().values().collect();
    // Top by CPU
    processes.sort_by(|a, b| b.cpu_usage().partial_cmp(&a.cpu_usage()).unwrap_or(std::cmp::Ordering::Equal));
    let top_processes = processes.iter().take(5).map(|proc| ProcessInfo {
        name: proc.name().to_string(),
        pid: proc.pid().as_u32() as i32,
        cpu_usage: proc.cpu_usage(),
        memory: proc.memory(),
    }).collect();
    // Top by Memory (use virtual memory as RSS is unavailable)
    processes.sort_by(|a, b| b.memory().cmp(&a.memory()));
    let top_mem_processes = processes.iter().take(5).map(|proc| ProcessInfo {
        name: proc.name().to_string(),
        pid: proc.pid().as_u32() as i32,
        cpu_usage: proc.cpu_usage(),
        memory: proc.memory(),
    }).collect();
    SystemStats {
        cpu_usage,
        total_memory,
        used_memory,
        top_processes,
        top_mem_processes,
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![get_disks, get_system_stats])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
