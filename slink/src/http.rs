use wasm_bindgen::prelude::*;
use wasm_bindgen_futures::JsFuture;
use web_sys::{Request, RequestInit, RequestMode, Response};
use serde::Deserialize;

// Error type for HTTP operations
#[derive(Debug)]
pub enum HttpError {
    FetchError(String),
    JsonError(String),
}

impl std::fmt::Display for HttpError {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        match self {
            HttpError::FetchError(msg) => write!(f, "Fetch error: {}", msg),
            HttpError::JsonError(msg) => write!(f, "JSON error: {}", msg),
        }
    }
}

impl std::error::Error for HttpError {}

// Function to fetch data from a URL
pub async fn fetch_data(url: &str) -> Result<String, HttpError> {
    // Create a request
    let opts = RequestInit::new();
    opts.set_method("GET");
    opts.set_mode(RequestMode::Cors);

    let request = Request::new_with_str_and_init(url, &opts)
        .map_err(|e| HttpError::FetchError(format!("Failed to create request: {:?}", e)))?;

    // Set request headers
    request.headers().set("Accept", "application/json")
        .map_err(|e| HttpError::FetchError(format!("Failed to set headers: {:?}", e)))?;

    // Get the window object
    let window = web_sys::window()
        .ok_or_else(|| HttpError::FetchError("No window object available".to_string()))?;

    // Fetch the URL
    let resp_value = JsFuture::from(window.fetch_with_request(&request))
        .await
        .map_err(|e| HttpError::FetchError(format!("Failed to fetch: {:?}", e)))?;

    // Convert response to Response object
    let resp: Response = resp_value.dyn_into()
        .map_err(|_| HttpError::FetchError("Failed to convert response".to_string()))?;

    // Check if response is OK
    if !resp.ok() {
        return Err(HttpError::FetchError(format!(
            "HTTP error: {} {}",
            resp.status(),
            resp.status_text()
        )));
    }

    // Get response text
    let text = JsFuture::from(resp.text()
        .map_err(|e| HttpError::FetchError(format!("Failed to get response text: {:?}", e)))?)
        .await
        .map_err(|e| HttpError::FetchError(format!("Failed to get response text: {:?}", e)))?;

    // Convert JsValue to String
    let text_string = text.as_string()
        .ok_or_else(|| HttpError::FetchError("Failed to convert response to string".to_string()))?;

    Ok(text_string)
}

// Function to fetch JSON data and parse it
pub async fn fetch_json<T>(url: &str) -> Result<T, HttpError>
where
    T: for<'de> Deserialize<'de>,
{
    let text = fetch_data(url).await?;

    // Parse JSON
    serde_json::from_str(&text)
        .map_err(|e| HttpError::JsonError(format!("Failed to parse JSON: {}", e)))
}

// Log to console (helper function)
pub fn log(s: &str) {
    web_sys::console::log_1(&JsValue::from_str(s));
}
