//! Set up the panic hook for better error messages in WASM

#[cfg(target_arch = "wasm32")]
use wasm_bindgen::prelude::*;

/// Initialize the console error panic hook for better error messages in WASM
#[cfg(target_arch = "wasm32")]
pub fn set_panic_hook() {
    // When the `console_error_panic_hook` feature is enabled, we can call the
    // `set_panic_hook` function to get better error messages if we ever panic.
    console_error_panic_hook::set_once();

    // Set up a custom panic hook for more detailed error messages
    std::panic::set_hook(Box::new(|panic_info| {
        // Make sure the panic hook is set
        console_error_panic_hook::set_once();

        // Log the panic info
        if let Some(s) = panic_info.payload().downcast_ref::<&str>() {
            web_sys::console::error_1(&format!("Panic: {}", s).into());
        } else {
            web_sys::console::error_1(&"Panic occurred".into());
        }

        if let Some(location) = panic_info.location() {
            web_sys::console::error_1(&format!("Location: {}:{}", location.file(), location.line()).into());
        }
    }));
}

/// Initialize WASM-specific functionality
#[cfg(target_arch = "wasm32")]
#[wasm_bindgen(start)]
pub fn wasm_init() {
    // Set the panic hook
    set_panic_hook();

    // Log initialization
    web_sys::console::log_1(&"WASM module initialized".into());
}

/// No-op function for non-WASM targets
#[cfg(not(target_arch = "wasm32"))]
pub fn set_panic_hook() {
    // This is a no-op in non-WASM environments
}
