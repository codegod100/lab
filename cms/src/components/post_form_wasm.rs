// wasm.rs
// All wasm32-specific code for PostForm
#![allow(dead_code)]

#[cfg(target_arch = "wasm32")]
pub mod wasm {
    pub use crate::utils::{get_quill_html, init_quill, set_quill_html, Quill};
    pub use wasm_bindgen::JsCast;
    pub use wasm_bindgen::JsValue;
    pub use web_sys::console;
    // You can add more WASM-specific helpers here as needed.
}
