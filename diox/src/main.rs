use dioxus::prelude::*;
#[cfg(feature = "server")]
use sea_orm::{Database, DbErr};

#[cfg(feature = "server")]
use once_cell::sync::Lazy;
#[cfg(feature = "server")]
use std::sync::Mutex;

#[cfg(feature = "server")]
static DB: Lazy<Mutex<Option<sea_orm::DatabaseConnection>>> = Lazy::new(|| Mutex::new(None));

#[derive(Debug, Clone, Routable, PartialEq)]
#[rustfmt::skip]
enum Route {
    #[layout(Navbar)]
    #[route("/")]
    Home {},
    #[route("/blog/:id")]
    Blog { id: i32 },
}

const FAVICON: Asset = asset!("/assets/favicon.ico");
const MAIN_CSS: Asset = asset!("/assets/main.css");
const HEADER_SVG: Asset = asset!("/assets/header.svg");
const TAILWIND_CSS: Asset = asset!("/assets/tailwind.css");

fn main() {
    dioxus::launch(App);
}
#[server]
async fn init() -> Result<(), ServerFnError> {
    let db_file = "sqlite:./sqlite.db?mode=rwc";
    let db = Database::connect(db_file).await?;
    *DB.lock().unwrap() = Some(db);
    Ok(())
}

#[server]
async fn db_info() -> Result<String, ServerFnError> {
    println!("Database info: {:?}", DB.lock().unwrap());
    Ok("test".to_string())
}

#[component]
fn DBInfo() -> Element {
    let mut db_info_result = use_signal(|| String::new());
    rsx! {
        div {
            id: "db-info",

            button {
                onclick: move |_| async move {
                    if let Ok(info) = db_info().await {
                        db_info_result.set(info);
                    }
                },
                "Get Database Info"
            }

            p { "Database info: {db_info_result}" }
        }
    }
}

#[component]
fn App() -> Element {
    spawn(async move {
        init().await.unwrap();
    });
    rsx! {
        document::Link { rel: "icon", href: FAVICON }
        document::Link { rel: "stylesheet", href: MAIN_CSS } document::Link { rel: "stylesheet", href: TAILWIND_CSS }
        Router::<Route> {}
    }
}

#[component]
pub fn Hero() -> Element {
    rsx! {
        div {
            id: "hero",
            img { src: HEADER_SVG, id: "header" }
            div { id: "links",
                a { href: "https://dioxuslabs.com/learn/0.6/", "📚 Learn Dioxus" }
                a { href: "https://dioxuslabs.com/awesome", "🚀 Awesome Dioxus" }
                a { href: "https://github.com/dioxus-community/", "📡 Community Libraries" }
                a { href: "https://github.com/DioxusLabs/sdk", "⚙️ Dioxus Development Kit" }
                a { href: "https://marketplace.visualstudio.com/items?itemName=DioxusLabs.dioxus", "💫 VSCode Extension" }
                a { href: "https://discord.gg/XgGxMSkvUM", "👋 Community Discord" }
            }
        }
    }
}

/// Home page
#[component]
fn Home() -> Element {
    rsx! {
        // Hero {}
        DBInfo {}
        Echo {}
    }
}

/// Blog page
#[component]
pub fn Blog(id: i32) -> Element {
    rsx! {
        div {
            id: "blog",

            // Content
            if id == 69 {
                h1 { "Nice! This is the special blog #69!" }
                p { "You found the secret page! In this special blog, we're showing how conditional rendering works in Dioxus." }
            } else {
                h1 { "This is blog #{id}!" }
                p { "In blog #{id}, we show how the Dioxus router works and how URL parameters can be passed as props to our route components." }
            }

            // Navigation links
            Link {
                to: Route::Blog { id: id - 1 },
                "Previous"
            }
            span { " <---> " }
            Link {
                to: Route::Blog { id: id + 1 },
                "Next"
            }
        }
    }
}

/// Shared navbar component.
#[component]
fn Navbar() -> Element {
    rsx! {
        div {
            id: "navbar",
            Link {
                to: Route::Home {},
                "Home"
            }
            Link {
                to: Route::Blog { id: 69 },
                "Blog"
            }
        }

        Outlet::<Route> {}
    }
}

/// Echo component that demonstrates fullstack server functions.
#[component]
fn Echo() -> Element {
    let mut response = use_signal(|| String::new());

    rsx! {
        div {
            id: "echo",
            h4 { "ServerFn Echo" }
            input {
                placeholder: "Type here to echo...",
                oninput:  move |event| async move {
                    let data = echo_server(event.value()).await.unwrap();
                    response.set(data);
                },
            }

            if !response().is_empty() {
                p {
                    "Server echoed: "
                   span { "{response}" }
                }
            }
        }
    }
}

/// Echo the user input on the server.
#[server(EchoServer)]
async fn echo_server(input: String) -> Result<String, ServerFnError> {
    if input.len() > 0 {
        let out = format!("😻 {input} 😘");
        Ok(out)
    } else {
        Ok(String::new())
    }
}
