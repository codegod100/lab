use dioxus::prelude::*;

mod routes;
mod models;
mod components;
mod pages;
mod utils;
mod db;

use routes::Route;

const FAVICON: Asset = asset!("/assets/favicon.ico");
const TAILWIND_CSS: Asset = asset!("/assets/tailwind.css");

fn main() {
    // Initialize the database
    // This will create the database and tables if they don't exist
    // and load the initial data if needed
    let _ = &db::DB_POOL;

    // Launch the app
    dioxus::launch(App);
}

#[component]
fn App() -> Element {
    rsx! {
        document::Link { rel: "icon", href: FAVICON }
        document::Link { rel: "stylesheet", href: TAILWIND_CSS }
        Router::<Route> {}
    }
}


