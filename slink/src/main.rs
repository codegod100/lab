mod http;

use wasm_bindgen::prelude::*;
use wasm_bindgen_futures::spawn_local;

slint::include_modules!();

#[cfg_attr(target_arch = "wasm32",
           wasm_bindgen::prelude::wasm_bindgen(start))]
fn main() -> Result<(), JsValue> {
    // Create the main window
    let main_window = Demo::new().expect("Unable to create Demo");

    // Clone the window handle for use in callbacks
    let main_window_weak = main_window.as_weak();

    // Set up the fetch-api-data callback
    main_window.on_fetch_api_data(move || {
        // Clone the window handle for use in the async block
        let window_handle = main_window_weak.clone();

        // Get the API URL from the UI
        let api_url = main_window_weak.unwrap().get_api_url().to_string();

        // Set loading state to true
        main_window_weak.unwrap().set_is_loading(true);

        // Spawn an async task to fetch the data
        spawn_local(async move {
            // Log the URL we're fetching
            http::log(&format!("Fetching data from: {}", api_url));

            // Fetch the data
            match http::fetch_data(&api_url).await {
                Ok(data) => {
                    // Log success
                    http::log(&format!("Successfully fetched data: {}", data));

                    // Update the UI with the fetched data
                    if let Some(window) = window_handle.upgrade() {
                        // Try to parse and pretty-print the JSON data
                        let formatted_data = if data.trim().starts_with('{') || data.trim().starts_with('[') {
                            match serde_json::from_str::<serde_json::Value>(&data) {
                                Ok(json_value) => {
                                    match serde_json::to_string_pretty(&json_value) {
                                        Ok(pretty) => pretty,
                                        Err(_) => data.clone()
                                    }
                                },
                                Err(_) => data.clone()
                            }
                        } else {
                            data.clone()
                        };

                        // Set the API data
                        window.set_api_data(formatted_data.into());

                        // Add the data as a message
                        window.invoke_add_api_data_as_message();

                        // Set loading state to false
                        window.set_is_loading(false);
                    }
                },
                Err(err) => {
                    // Log error
                    http::log(&format!("Error fetching data: {}", err));

                    // Update the UI with the error message
                    if let Some(window) = window_handle.upgrade() {
                        // Set the API data to the error message
                        window.set_api_data(format!("Error: {}", err).into());

                        // Add the error as a message
                        window.invoke_add_api_data_as_message();

                        // Set loading state to false
                        window.set_is_loading(false);
                    }
                }
            }
        });
    });

    // Run the application
    main_window.run().expect("Unable to run Demo");
    Ok(())
}