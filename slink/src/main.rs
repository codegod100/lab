
slint::include_modules!();
#[cfg_attr(target_arch = "wasm32",
           wasm_bindgen::prelude::wasm_bindgen(start))]
fn main() -> Result<(), wasm_bindgen::JsValue> {
    let main_window = Demo::new().expect("Unable to create Demo");

    main_window.run().expect("Unable to run Demo");
    Ok(())
}