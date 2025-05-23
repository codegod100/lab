pub mod app;
// use wasm_bindgen::prelude::*;


#[cfg(feature = "hydrate")]
#[wasm_bindgen::prelude::wasm_bindgen]
pub fn hydrate() {
    use crate::app::*;
    // log("testing");
    console_error_panic_hook::set_once();
    leptos::mount::hydrate_body(App);
}
