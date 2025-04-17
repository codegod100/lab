use dioxus::prelude::*;

mod routes;
mod models;
mod components;
mod pages;
mod utils;
mod db;

#[cfg(target_arch = "wasm32")]
use wasm_bindgen::prelude::*;

#[cfg(target_arch = "wasm32")]
use console_error_panic_hook;

use routes::Route;

const FAVICON: Asset = asset!("/assets/favicon.ico");
const TAILWIND_CSS: Asset = asset!("/assets/tailwind.css");
const CUSTOM_CSS: Asset = asset!("/assets/custom.css");

fn main() {
    // Initialize the panic hook for better error messages in WASM
    utils::panic_hook::set_panic_hook();

    // Initialize the database
    // This will create the database and tables if they don't exist
    // and load the initial data if needed
    let _ = &db::DB_POOL;

    // Initialize the users
    // This will ensure the static USERS variable is initialized
    let users = &models::user::USERS;
    println!("Initialized users: {} users available", users.lock().unwrap().len());

    // Print a message to confirm server functions are enabled
    #[cfg(not(target_arch = "wasm32"))]
    println!("Server functions are enabled. Starting server...");

    // Print a message to confirm router initialization
    println!("Initializing router...");

    // Launch the app
    dioxus::launch(App);
}

#[component]
fn App() -> Element {
    rsx! {
        document::Link { rel: "icon", href: FAVICON }
        document::Link { rel: "stylesheet", href: TAILWIND_CSS }
        document::Link { rel: "stylesheet", href: CUSTOM_CSS }
        Router::<Route> {}
    }
}


