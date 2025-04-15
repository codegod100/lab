
slint::include_modules!();
#[cfg_attr(target_arch = "wasm32",
           wasm_bindgen::prelude::wasm_bindgen(start))]
fn main() -> Result<(), wasm_bindgen::JsValue> {
    let main_window = Demo::new().unwrap();

    main_window.run().unwrap();
    Ok(())
}