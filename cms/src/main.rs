use dioxus::prelude::*;
use dioxus_logger::tracing;

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
    wasm_logger::init(wasm_logger::Config::default());
    // Initialize tracing for better logging
    #[cfg(target_arch = "wasm32")]
    dioxus_logger::init(dioxus_logger::tracing::Level::INFO).unwrap();
    #[cfg(not(target_arch = "wasm32"))]
    dioxus_logger::init(dioxus_logger::tracing::Level::INFO).unwrap();

    // Initialize the panic hook for better error messages in WASM
    utils::panic_hook::set_panic_hook();

    // Initialize the database
    // This will create the database and tables if they don't exist
    // and load the initial data if needed
    let _ = &db::DB_POOL;

    // Initialize the users
    // This will ensure the static USERS variable is initialized
    let users = &models::user::USERS;

    // Explicitly access the users to ensure the static is initialized
    match users.lock() {
        Ok(guard) => {
            let count = guard.len();
            println!("Initialized users: {} users available", count);
            tracing::info!("Initialized users: {} users available", count);

            // Log each user for debugging
            for user in guard.iter() {
                println!("User initialized: id={}, username={}, role={:?}", user.id, user.username, user.role);
                tracing::info!("User initialized: id={}, username={}, role={:?}", user.id, user.username, user.role);
            }
        },
        Err(e) => {
            println!("Failed to lock USERS mutex during initialization: {}", e);
            tracing::info!("Failed to lock USERS mutex during initialization: {}", e);
        }
    };

    // Print a message to confirm server functions are enabled
    #[cfg(not(target_arch = "wasm32"))]
    println!("Server functions are enabled. Starting server...");

    // Print a message to confirm router initialization
    println!("Initializing router...");
    tracing::info!("Initializing router...");

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


