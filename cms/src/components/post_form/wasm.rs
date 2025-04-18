#![cfg(target_arch = "wasm32")]
// All wasm32-specific code for PostForm
#![allow(dead_code)]

pub use crate::utils::{get_quill_html, init_quill, set_quill_html, Quill};
pub use wasm_bindgen::JsCast;
pub use wasm_bindgen::JsValue;
pub use web_sys::console;
pub use web_sys;
