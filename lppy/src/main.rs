use leptos::prelude::*;
use wasm_bindgen::prelude::*;
use leptos_meta::*;
stylance::import_crate_style!(style, "src/style.module.scss");
#[wasm_bindgen(module = "/bundle.js")]
extern "C" {
    fn foo()->String;
    fn printProgress();
}
#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
    #[wasm_bindgen(js_namespace = localStorage)]
    fn setItem(k: &str, v: &str);
    #[wasm_bindgen(js_namespace = localStorage)]
    fn getItem(k: &str)->String;
}
#[component]
fn App() -> impl IntoView {
    provide_meta_context();
    let (count, set_count) = signal(0);

    view! {
        <p >text</p>
        <div><button 
        on:click=move |_|{
            printProgress();
            setItem("foo","bar");
        }>"Set value"</button></div>
        <div><button 
        on:click=move |_|{
            log(&getItem("foo"));
        }>"Get value"</button></div>
        <button
            on:click=move |_| {
                log(&foo());
                // panic!("yolo");
                set_count.set(count.get()+1)
            }>
            "Click me: "
            {count}
        </button>
        <p>
            "Double count: "
            {move || count.get() * 2}
        </p>
    }
}

fn main() {
    console_error_panic_hook::set_once();
    mount_to_body(App);
}