use leptos::prelude::*;
use leptos::Params;
use leptos_meta::{provide_meta_context, MetaTags, Stylesheet, Title};
use leptos_router::params::Params;
use leptos_router::{
    components::{Route, Router, Routes},
    StaticSegment,
};
use serde::{Deserialize, Serialize};

pub fn shell(options: LeptosOptions) -> impl IntoView {
    view! {
        <!DOCTYPE html>
        <html lang="en">
            <head>
                <meta charset="utf-8"/>
                <meta name="viewport" content="width=device-width, initial-scale=1"/>
                <AutoReload options=options.clone() />
                <HydrationScripts options/>
                <MetaTags/>
            </head>
            <body>
                <App/>
            </body>
        </html>
    }
}

#[component]
pub fn App() -> impl IntoView {
    // Provides context that manages stylesheets, titles, meta tags, etc.
    provide_meta_context();

    view! {
        // injects a stylesheet into the document <head>
        // id=leptos means cargo-leptos will hot-reload this stylesheet
        <Stylesheet id="leptos" href="/pkg/lop.css"/>

        // sets the document title
        <Title text="Nandi's Laboratory"/>

        // content for this welcome page
        <Router>
            <main>
                <Routes fallback=|| "Page not found.".into_view()>
                    <Route path=StaticSegment("") view=HomePage/>
                    <Route path=leptos_router::path!("/users/:id") view=Users/>
                </Routes>
            </main>
        </Router>
    }
}
#[derive(Serialize, Deserialize, Clone)]
pub struct User {
    name: String,
    age: i32,
}
#[server]
pub async fn get_users() -> Result<Vec<User>, ServerFnError> {
    println!("on server");
    Ok(vec![
        User {
            name: "foo".to_string(),
            age: 23,
        },
        User {
            name: "bob".to_string(),
            age: 42,
        },
    ])
}

#[cfg(feature = "hydrate")]
#[wasm_bindgen::prelude::wasm_bindgen]
extern "C" {
    #[wasm_bindgen::prelude::wasm_bindgen(js_namespace = console)]
    pub fn log(s: &str);
    #[wasm_bindgen::prelude::wasm_bindgen(js_namespace = localStorage)]
    fn setItem(k: &str, v: &str);
    #[wasm_bindgen::prelude::wasm_bindgen(js_namespace = localStorage)]
    fn getItem(k: &str) -> String;
    fn alert(s: &str);
}

#[cfg(feature = "hydrate")]
#[wasm_bindgen::prelude::wasm_bindgen(module = "/index.js")]
extern "C" {
    fn foo() -> String;
    #[wasm_bindgen::prelude::wasm_bindgen(js_name = users, thread_local_v2)]
    static js_users: Vec<String>;
}

#[derive(Params, PartialEq)]
struct UsersParams {
    id: Option<usize>,
}

#[component]
fn Users() -> impl IntoView {
    let params = leptos_router::hooks::use_params::<UsersParams>();
    let id = move || {
        params
            .read()
            .as_ref()
            .ok()
            .and_then(|params| params.id)
            .unwrap_or_default()
    };
    let count = std::iter::successors(Some(0), |&i| if i < id() { Some(i + 1) } else { None });
    view! {
        <Show
        when=move || {id() != 0}
        fallback=|| view!{ <div>invalid id</div>}>
        <div>hello world - {id}</div>


        </Show>

        {  count.into_iter().map(|n| view! { number is {n}}).collect::<Vec<_>>()}

    }
}
#[cfg(feature = "hydrate")]
#[island]
fn Island() -> impl IntoView {
    let f = foo();
    view! {"hello" {f}}
}
/// Renders the home page of your application.
#[component]
fn HomePage() -> impl IntoView {
    // Creates a reactive value to update the button
    let count = RwSignal::new(0);
    let (users, set_users) = signal(vec![]);
    let (client, set_client) = signal("");
    let on_click = move |_| {
        leptos::task::spawn_local(async move {
            let u = get_users().await.unwrap();
            set_users.set(u);
            set_client.set("I am in client");
        });
    };
    let (f, set_f) = signal("".to_string());
    #[cfg(feature = "hydrate")]
    Effect::new(move |_| {
        log(&format!("js_users: {}", format_js_users()));
        set_f.set(foo());
    });
    #[cfg(feature = "hydrate")]
    fn format_js_users() -> String {
        let mut result = Vec::new();
        js_users.with(|users| {
            for user in users {
                result.push(user.clone());
            }
        });
        format!("{:?}", result)
    }
    view! {
        <h1>"Nandi's Laboratory"</h1>
        <div class="blood">this is server rendered</div>
        <button on:click=on_click>"Click Me: " {count}</button>
        <div>{client}</div>
        <div>{f}</div>
        <div><a href="/users/18">users</a></div>
        {move || users.get().into_iter().map(|user| view! { <div>"Name: " {user.name} ", Age: " {user.age}</div>}).collect::<Vec<_>>()}
    }
}
