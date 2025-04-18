// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use gstreamer as gst;
use gstreamer::prelude::*;
use gstreamer_app;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
async fn get_audio_chunk() -> Result<Vec<f32>, String> {
    // Initialize GStreamer (safe to call multiple times)
    gst::init().map_err(|e| format!("Failed to initialize GStreamer: {}", e))?;

    // Correct way: build pipeline from description using gst::parse_launch
    let pipeline = gst::parse::launch(
        "pulsesrc device=default.monitor ! audioconvert ! audioresample ! audio/x-raw,format=F32LE,channels=1,rate=44100 ! appsink name=sink max-buffers=1 drop=true"
    ).map_err(|e| format!("Failed to parse pipeline: {}", e))?
    .downcast::<gst::Pipeline>()
    .map_err(|_| "Failed to downcast pipeline".to_string())?;
    let appsink = pipeline.by_name("sink").ok_or("Appsink not found")?.dynamic_cast::<gstreamer_app::AppSink>().map_err(|_| "Failed to cast appsink".to_string())?;

    pipeline.set_state(gst::State::Playing).map_err(|e| format!("Failed to set pipeline to Playing: {:?}", e))?;

    // Pull a sample (with timeout)
    let sample = appsink.try_pull_sample(gst::ClockTime::from_mseconds(200)).ok_or("Failed to pull sample from appsink")?;
    let buffer = sample.buffer().ok_or("No buffer in sample")?;
    let map = buffer.map_readable().map_err(|_| "Failed to map buffer")?;
    let data = map.as_slice();

    // Convert &[u8] to &[f32]
    if data.len() % 4 != 0 {
        return Err("Unexpected buffer size (not a multiple of 4)".to_string());
    }
    let n_samples = data.len() / 4;
    let mut out = Vec::with_capacity(n_samples);
    for chunk in data.chunks_exact(4) {
        let bytes = [chunk[0], chunk[1], chunk[2], chunk[3]];
        out.push(f32::from_le_bytes(bytes));
    }

    pipeline.set_state(gst::State::Null).ok();
    Ok(out)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet, get_audio_chunk])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
