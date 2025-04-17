use dioxus::prelude::*;
use wasm_bindgen::prelude::*;
use wasm_bindgen::JsCast;

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
    fn new(options: JsValue) -> Quill;

    #[wasm_bindgen(method)]
    fn getContents(this: &Quill) -> JsValue;

    #[wasm_bindgen(method)]
    fn setContents(this: &Quill, delta: JsValue) -> JsValue;

    #[wasm_bindgen(method)]
    fn getText(this: &Quill) -> String;

    // Note: The root method is not directly available on Quill
    // We'll use a different approach to get the editor content

    #[wasm_bindgen(method)]
    fn on(this: &Quill, event: &str, callback: &Closure<dyn FnMut(JsValue, JsValue)>) -> JsValue;
}

pub fn init_quill(editor_id: &str) -> Result<Quill, JsValue> {
    // Simple check for element existence
    if let Some(window) = web_sys::window() {
        if let Some(document) = window.document() {
            if document.query_selector(editor_id).map_err(|_| JsValue::from_str("Query error"))?.is_none() {
                log(&format!("Editor element {} not found", editor_id));
                return Err(JsValue::from_str("Editor element not found"));
            }
        }
    }

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
    js_sys::Reflect::set(&options, &JsValue::from_str("container"), &JsValue::from_str(editor_id))?;
    let quill = Quill::new(options.into());
    log(&format!("Quill editor initialized for {}", editor_id));

    Ok(quill)
}

pub fn get_quill_html(quill: &Quill) -> String {
    // First try to get the text content directly from Quill
    // This is a fallback in case we can't access the DOM element
    let quill_text = quill.getText();

    // Find the editor content element
    if let Some(window) = web_sys::window() {
        if let Some(document) = window.document() {
            // Try to find the editor content element
            if let Ok(Some(editor_content)) = document.query_selector(".ql-editor") {
                let html = editor_content.inner_html();
                if !html.is_empty() {
                    return html;
                }
                log("Editor element found but HTML is empty");
            } else {
                // If the editor element isn't found, log a message
                log("Could not find .ql-editor element when getting HTML");
            }
        }
    }

    // If we couldn't get the HTML but have text, create a simple HTML version
    if !quill_text.is_empty() {
        return format!("<p>{}</p>", quill_text.replace("\n", "<br>"));
    }

    // If all else fails, return an empty string
    String::new()
}

pub fn set_quill_html(quill: &Quill, html: &str) {
    // Find the editor content element
    if let Some(window) = web_sys::window() {
        if let Some(document) = window.document() {
            // Try to find the editor content element
            if let Ok(Some(editor_content)) = document.query_selector(".ql-editor") {
                // Set the HTML content
                let _ = editor_content.set_inner_html(html);
            } else {
                // If the editor element isn't found, log a message
                log("Could not find .ql-editor element, will try again later");

                // Schedule another attempt with a longer delay
                let html_clone = html.to_string();
                let closure = wasm_bindgen::closure::Closure::once_into_js(move || {
                    if let Some(window) = web_sys::window() {
                        if let Some(document) = window.document() {
                            if let Ok(Some(editor_content)) = document.query_selector(".ql-editor") {
                                let _ = editor_content.set_inner_html(&html_clone);
                                log("Successfully set editor content on retry");
                            } else {
                                log("Still could not find .ql-editor element after delay");
                            }
                        }
                    }
                });

                if let Some(window) = web_sys::window() {
                    let _ = window.set_timeout_with_callback_and_timeout_and_arguments_0(
                        closure.as_ref().unchecked_ref(),
                        500 // 500ms delay
                    );
                }
            }
        }
    }
}
