use dioxus::prelude::*;
use std::sync::{Arc, Mutex};
use once_cell::sync::Lazy;
use serde::{Serialize, Deserialize};

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
const TAILWIND_CSS: Asset = asset!("/assets/tailwind.css");

// Post struct for CMS
#[derive(Clone, Debug, Serialize, Deserialize, PartialEq)]
pub struct Post {
    pub id: usize,
    pub title: String,
    pub body: String,
    pub published: bool,
}

// Global in-memory store for posts
static POSTS: Lazy<Arc<Mutex<Vec<Post>>>> = Lazy::new(|| Arc::new(Mutex::new(vec![])));

fn main() {
    dioxus::launch(App);
}

#[component]
fn App() -> Element {
    rsx! {
        document::Link { rel: "icon", href: FAVICON }
        document::Link { rel: "stylesheet", href: MAIN_CSS } document::Link { rel: "stylesheet", href: TAILWIND_CSS }
        Router::<Route> {}
    }
}

// Removed Hero component as it was boilerplate

/// Home page
#[component]
fn Home() -> Element {
    rsx! {
        div { class: "container mx-auto p-4",
            h1 { class: "text-3xl font-bold mb-6", "Content Management System" }
            p { class: "mb-8 text-gray-300", "Welcome to your content management system. Use the tools below to manage your posts." }
            AdminPosts {}
        }
    }
}

// Admin UI for managing posts
#[component]
fn AdminPosts() -> Element {
    let mut reload_signal = use_signal(|| ());
    let posts = use_resource(move || {
        let _ = reload_signal();
        async move { get_posts_server().await.unwrap_or_default() }
    });
    let mut title = use_signal(|| String::new());
    let mut body = use_signal(|| String::new());
    let mut published = use_signal(|| false);

    rsx! {
        div { class: "bg-gray-800 rounded-lg p-6 shadow-lg",
            h2 { class: "text-2xl font-bold mb-6 border-b border-gray-700 pb-2", "Manage Posts" }

            // Post creation form
            div { class: "mb-8 bg-gray-900 p-4 rounded-md",
                h3 { class: "text-xl font-semibold mb-4", "Create New Post" }
                form { class: "space-y-4",
                    onsubmit: move |evt| async move {
                        evt.prevent_default();
                        let new_post = Post {
                            id: 0,
                            title: title().clone(),
                            body: body().clone(),
                            published: published(),
                        };
                        let _ = create_post_server(new_post).await;
                        reload_signal.set(());
                        title.set(String::new());
                        body.set(String::new());
                        published.set(false);
                    },
                    div { class: "mb-3",
                        label { class: "block text-sm font-medium text-gray-400 mb-1", "Title" }
                        input {
                            class: "w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500",
                            r#type: "text",
                            value: "{title}",
                            placeholder: "Enter post title",
                            oninput: move |e| title.set(e.value())
                        }
                    }
                    div { class: "mb-3",
                        label { class: "block text-sm font-medium text-gray-400 mb-1", "Content" }
                        textarea {
                            class: "w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]",
                            value: "{body}",
                            placeholder: "Enter post content",
                            oninput: move |e| body.set(e.value())
                        }
                    }
                    div { class: "mb-3 flex items-center",
                        label { class: "flex items-center cursor-pointer",
                            input {
                                class: "mr-2 h-4 w-4",
                                r#type: "checkbox",
                                checked: "{published}",
                                onchange: move |e| published.set(e.value() == "on")
                            }
                            span { class: "text-sm text-gray-300", "Publish immediately" }
                        }
                    }
                    button {
                        class: "px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800",
                        r#type: "submit",
                        "Create Post"
                    }
                }
            }

            // Posts list
            div {
                h3 { class: "text-xl font-semibold mb-4", "Existing Posts" }

                // Loading state
                {match posts().as_ref() {
                    None => rsx!(
                        div { class: "text-center py-4",
                            p { class: "text-gray-400", "Loading posts..." }
                        }
                    ),
                    Some(posts_list) if posts_list.is_empty() => rsx!(
                        div { class: "text-center py-4 border border-dashed border-gray-700 rounded-md",
                            p { class: "text-gray-400", "No posts yet. Create your first post above." }
                        }
                    ),
                    Some(posts_list) => rsx!(
                        div { class: "space-y-3",
                            {posts_list.iter().map(|post| {
                                rsx!(
                                    div {
                                        class: if post.published { "bg-gray-700 p-4 rounded-md border-l-4 border-green-500" } else { "bg-gray-700 p-4 rounded-md border-l-4 border-yellow-500" },
                                        key: post.id,
                                        div { class: "flex justify-between items-center mb-2",
                                            h4 { class: "font-bold text-lg", "{post.title}" }
                                            span {
                                                class: if post.published { "px-2 py-1 text-xs rounded-full bg-green-800 text-green-200" } else { "px-2 py-1 text-xs rounded-full bg-yellow-800 text-yellow-200" },
                                                {if post.published { "Published" } else { "Draft" }}
                                            }
                                        }
                                        p { class: "text-gray-300 text-sm", "{post.body}" }
                                    }
                                )
                            })}
                        }
                    )
                }}
            }
        }
    }
}

/// Blog page
#[component]
pub fn Blog(id: i32) -> Element {
    // Get published posts to display
    let posts = use_resource(|| async move { get_published_posts().await.unwrap_or_default() });

    rsx! {
        div { class: "container mx-auto p-4",
            // Header
            div { class: "mb-8",
                h1 { class: "text-3xl font-bold mb-2", "Blog" }
                p { class: "text-gray-300", "View all published posts" }
            }

            // Blog content
            div { class: "bg-gray-800 rounded-lg p-6 shadow-lg",
                // Loading state
                {match posts().as_ref() {
                    None => rsx!(
                        div { class: "text-center py-8",
                            p { class: "text-gray-400", "Loading blog posts..." }
                        }
                    ),
                    Some(posts_list) if posts_list.is_empty() => rsx!(
                        div { class: "text-center py-8 border border-dashed border-gray-700 rounded-md",
                            p { class: "text-gray-400", "No published posts available yet." }
                        }
                    ),
                    Some(posts_list) => rsx!(
                        div { class: "space-y-6",
                            {posts_list.iter().map(|post| {
                                rsx!(
                                    article {
                                        class: "bg-gray-700 p-5 rounded-md",
                                        key: post.id,
                                        h2 { class: "text-2xl font-bold mb-3", "{post.title}" }
                                        p { class: "text-gray-300 mb-4", "{post.body}" }
                                        div { class: "text-sm text-gray-400", "Post ID: {post.id}" }
                                    }
                                )
                            })}
                        }
                    )
                }}
            }
        }
    }
}

/// Shared navbar component.
#[component]
fn Navbar() -> Element {
    rsx! {
        div { class: "bg-gray-900 shadow-md mb-6",
            div { class: "container mx-auto px-4 py-3",
                div { class: "flex items-center justify-between",
                    // Logo/Brand
                    div { class: "text-xl font-bold text-white", "CMS" }

                    // Navigation links
                    nav { class: "flex space-x-4",
                        Link {
                            class: "px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition-colors",
                            to: Route::Home {},
                            "Dashboard"
                        }
                        Link {
                            class: "px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition-colors",
                            to: Route::Blog { id: 1 },
                            "Blog"
                        }
                    }
                }
            }
        }

        Outlet::<Route> {}
    }
}

// Echo component removed as it's not needed for the CMS

// Server function: Get all posts
#[server(GetPostsServer)]
async fn get_posts_server() -> Result<Vec<Post>, ServerFnError> {
    let posts = POSTS.lock().unwrap().clone();
    Ok(posts)
}

// Server function: Create post
#[server(CreatePostServer)]
async fn create_post_server(new_post: Post) -> Result<(), ServerFnError> {
    let mut posts = POSTS.lock().unwrap();
    let id = posts.len() + 1;
    let mut post = new_post;
    post.id = id;
    posts.push(post);
    Ok(())
}

// Public endpoint: Serve published posts as JSON
#[server(GetPublishedPosts)]
async fn get_published_posts() -> Result<Vec<Post>, ServerFnError> {
    let posts = POSTS.lock().unwrap();
    Ok(posts.iter().filter(|p| p.published).cloned().collect())
}
