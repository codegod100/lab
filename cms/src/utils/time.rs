use chrono::{DateTime, Utc};

/// Get the current timestamp in seconds since the Unix epoch
/// Works in both native and WASM environments
pub fn current_timestamp() -> u64 {
    #[cfg(target_arch = "wasm32")]
    {
        // In WASM, use js_sys to get the current time
        js_sys::Date::now() as u64 / 1000
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
    let datetime = DateTime::<Utc>::from_timestamp(timestamp as i64, 0)
        .map(|dt| dt.naive_local())
        .unwrap_or_else(|| DateTime::<Utc>::from_timestamp(0, 0).unwrap().naive_local());

    datetime.format("%B %d, %Y").to_string()
}

/// Format a timestamp as a relative time
/// Returns strings like "just now", "5 minutes ago", "2 hours ago", or a formatted date
pub fn format_relative_time(timestamp: u64) -> String {
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
