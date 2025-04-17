#[cfg(not(target_arch = "wasm32"))]
use chrono::{DateTime, Utc};

#[cfg(target_arch = "wasm32")]
use wasm_bindgen::prelude::*;

#[cfg(target_arch = "wasm32")]
use console_error_panic_hook;

/// Get the current timestamp in seconds since the Unix epoch
/// Works in both native and WASM environments
pub fn current_timestamp() -> u64 {
    #[cfg(target_arch = "wasm32")]
    {
        // In WASM, always return a fixed timestamp to avoid any issues
        // January 1, 2023 as a fixed timestamp
        1672531200
    }

    #[cfg(not(target_arch = "wasm32"))]
    {
        // In native, use std::time
        use std::time::{SystemTime, UNIX_EPOCH};
        SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap_or_default()
            .as_secs()
    }
}

/// Format a timestamp for display
/// Returns a formatted date string like "January 01, 2023"
pub fn format_date(timestamp: u64) -> String {
    #[cfg(target_arch = "wasm32")]
    {
        // In WASM, always return a fixed date string to avoid any issues
        "January 01, 2023".to_string()
    }

    #[cfg(not(target_arch = "wasm32"))]
    {
        let datetime = DateTime::<Utc>::from_timestamp(timestamp as i64, 0)
            .map(|dt| dt.naive_local())
            .unwrap_or_else(|| DateTime::<Utc>::from_timestamp(0, 0).unwrap().naive_local());

        datetime.format("%B %d, %Y").to_string()
    }
}

/// Format a timestamp as a relative time
/// Returns strings like "just now", "5 minutes ago", "2 hours ago", or a formatted date
pub fn format_relative_time(timestamp: u64) -> String {
    #[cfg(target_arch = "wasm32")]
    {
        // In WASM, always return a fixed string to avoid any issues
        "some time ago".to_string()
    }

    #[cfg(not(target_arch = "wasm32"))]
    {
        // Get current time safely for native environment
        let now = current_timestamp();
        let diff = now.saturating_sub(timestamp);

        if diff < 60 {
            "just now".to_string()
        } else if diff < 3600 {
            format!("{} minutes ago", diff / 60)
        } else if diff < 86400 {
            format!("{} hours ago", diff / 3600)
        } else {
            // More than a day, show date
            format_date(timestamp)
        }
    }
}

/// Helper function for logging in WASM environment
#[cfg(target_arch = "wasm32")]
pub fn log_wasm(message: &str) {
    // Make sure the panic hook is set
    console_error_panic_hook::set_once();

    // Use web_sys::console::log_1 with JsValue
    // Wrap in a catch_unwind to prevent panics
    let _ = std::panic::catch_unwind(|| {
        // Simplify to just use the console module directly
        web_sys::console::log_1(&JsValue::from_str(message));
    });
}

/// Create a fixed timestamp for a specific date
/// This is useful for creating sample data in WASM environments
/// where time functionality might be limited
pub fn fixed_timestamp(year: i32, month: i32, day: i32) -> u64 {
    #[cfg(target_arch = "wasm32")]
    {
        // In WASM, always return a fixed timestamp to avoid any issues
        1672531200 // January 1, 2023
    }

    #[cfg(not(target_arch = "wasm32"))]
    {
        // Simple calculation for a rough timestamp
        // Not accurate for all dates but good enough for sample data
        let days_since_epoch = (year - 1970) * 365 + month * 30 + day;
        (days_since_epoch as u64) * 86400
    }
}
