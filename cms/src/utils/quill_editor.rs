use dioxus::prelude::*;
use wasm_bindgen::prelude::*;

// Console log binding
#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

// Define Quill as a JavaScript type
#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen]
    pub type Quill;

    #[wasm_bindgen(constructor)]
    fn new(element: &str, options: JsValue) -> Quill;

    #[wasm_bindgen(method)]
    fn getContents(this: &Quill) -> JsValue;

    #[wasm_bindgen(method)]
    fn setContents(this: &Quill, delta: JsValue) -> JsValue;

    #[wasm_bindgen(method)]
    fn getText(this: &Quill) -> String;

    #[wasm_bindgen(method, js_name = "root")]
    fn getRoot(this: &Quill) -> web_sys::Element;

    #[wasm_bindgen(method)]
    fn on(this: &Quill, event: &str, callback: &Closure<dyn FnMut(JsValue, JsValue)>) -> JsValue;
}

pub fn init_quill(editor_id: &str) -> Result<Quill, JsValue> {
    let options = js_sys::Object::new();
    let theme = js_sys::JsString::from("snow");
    js_sys::Reflect::set(&options, &JsValue::from_str("theme"), &theme)?;

    // Create modules object
    let modules = js_sys::Object::new();

    // Create toolbar options
    let toolbar_options = js_sys::Array::new();

    // Add formatting options
    let formatting = js_sys::Array::new();
    formatting.push(&JsValue::from_str("bold"));
    formatting.push(&JsValue::from_str("italic"));
    formatting.push(&JsValue::from_str("underline"));
    formatting.push(&JsValue::from_str("strike"));
    toolbar_options.push(&formatting);

    // Add header options
    let headers = js_sys::Array::new();
    headers.push(&JsValue::from_str("header"));
    let header_options = js_sys::Array::new();
    header_options.push(&JsValue::from_f64(1.0));
    header_options.push(&JsValue::from_f64(2.0));
    headers.push(&header_options);
    toolbar_options.push(&headers);

    // Add list options
    let list = js_sys::Array::new();
    list.push(&JsValue::from_str("list"));
    list.push(&JsValue::from_str("bullet"));
    toolbar_options.push(&list);

    // Add indent options
    let indent = js_sys::Array::new();
    indent.push(&JsValue::from_str("indent"));
    indent.push(&JsValue::from_str("-1"));
    indent.push(&JsValue::from_str("+1"));
    toolbar_options.push(&indent);

    // Add link and image options
    let link = js_sys::Array::new();
    link.push(&JsValue::from_str("link"));
    link.push(&JsValue::from_str("image"));
    toolbar_options.push(&link);

    // Set toolbar options
    let toolbar = js_sys::Object::new();
    js_sys::Reflect::set(&toolbar, &JsValue::from_str("container"), &toolbar_options)?;
    js_sys::Reflect::set(&modules, &JsValue::from_str("toolbar"), &toolbar)?;
    js_sys::Reflect::set(&options, &JsValue::from_str("modules"), &modules)?;

    // Create Quill instance
    let quill = Quill::new(editor_id, options.into());

    Ok(quill)
}

pub fn get_quill_html(quill: &Quill) -> String {
    // Find the editor content element
    let editor_content = web_sys::window()
        .unwrap()
        .document()
        .unwrap()
        .query_selector(".ql-editor")
        .unwrap()
        .unwrap();

    editor_content.inner_html()
}

pub fn set_quill_html(quill: &Quill, html: &str) {
    // Find the editor content element
    let editor_content = web_sys::window()
        .unwrap()
        .document()
        .unwrap()
        .query_selector(".ql-editor")
        .unwrap()
        .unwrap();

    editor_content.set_inner_html(html);
}
