use dioxus::prelude::*;

#[derive(Debug, Clone)]
struct Person {
    id: i32,
    name: String,
}

#[cfg(feature = "server")]
thread_local! {
    pub static DB: rusqlite::Connection = {
        let conn = rusqlite::Connection::open("sqlite.db").expect("Failed to open database");
        println!("creating db");
        conn.execute_batch(
            "CREATE TABLE IF NOT EXISTS people (
                id INTEGER PRIMARY KEY,
                name TEXT NOT NULL,
                age INTEGER NOT NULL
            );",
        ).unwrap();

        // Return the connection
        conn
    };
}

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
async fn insert_person(name: String, age: i32) -> Result<String, ServerFnError> {
    DB.with(|f| {
        f.execute(
            "INSERT INTO people (name, age) VALUES (?1, ?2)",
            &[&name, &age.to_string()],
        )
    })?;
    Ok("test".to_string())
}

#[server]
async fn get_person(id: i32) -> Result<String, ServerFnError> {
    let name = DB.with(|conn| {
        let mut stmt = conn.prepare("SELECT id, name FROM people WHERE id = ?")?;
        let mut rows = stmt.query([id])?;

        if let Some(row) = rows.next()? {
            Ok::<String, rusqlite::Error>(row.get::<_, String>(1)?)
        } else {
            Ok(format!("No person found with id {}", id))
        }
    })?;

    if name.starts_with("No person") {
        insert_person("test".to_string(), 42).await?;
    }

    Ok(name)
}

#[component]
fn DBInfo() -> Element {
    let mut db_info_result = use_signal(|| String::new());
    rsx! {
        div {
            id: "db-info",

            button {
                onclick: move |_| async move {
                    // insert_person("John Doe".to_string(), 30).await.unwrap();
                    if let Ok(info) = get_person(1).await {
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
