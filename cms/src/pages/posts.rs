use dioxus::prelude::*;
use crate::components::PostCard;
use crate::routes::Route;
use crate::utils::{get_posts_server, delete_post_server};

#[component]
pub fn Posts() -> Element {
    let mut posts = use_resource(|| async move {
        get_posts_server().await.unwrap_or_default()
    });

    let mut filter = use_signal(|| "all".to_string());
    let mut search_query = use_signal(|| String::new());
    let mut is_deleting = use_signal(|| false);
    let mut delete_error = use_signal(|| None::<String>);
    let mut delete_success = use_signal(|| false);

    let filtered_posts = move || {
        let posts_data = posts();
        let posts = match posts_data.as_ref() {
            Some(p) => p,
            None => return vec![],
        };

        let filtered = match filter().as_str() {
            "published" => posts.iter().filter(|p| p.published).cloned().collect::<Vec<_>>(),
            "drafts" => posts.iter().filter(|p| !p.published).cloned().collect::<Vec<_>>(),
            _ => posts.clone(),
        };

        if search_query().is_empty() {
            filtered
        } else {
            let query = search_query().to_lowercase();
            filtered.into_iter()
                .filter(|p| {
                    p.title.to_lowercase().contains(&query) ||
                    p.body.to_lowercase().contains(&query) ||
                    p.category.as_ref().map_or(false, |c| c.to_lowercase().contains(&query)) ||
                    p.tags.iter().any(|t| t.to_lowercase().contains(&query))
                })
                .collect()
        }
    };

    let mut handle_delete = move |id: usize| {
        is_deleting.set(true);
        delete_error.set(None);
        delete_success.set(false);

        spawn(async move {
            match delete_post_server(id).await {
                Ok(true) => {
                    delete_success.set(true);
                    posts.restart();
                }
                Ok(false) => {
                    delete_error.set(Some("Post not found".to_string()));
                }
                Err(e) => {
                    delete_error.set(Some(format!("Error: {}", e)));
                }
            }
            is_deleting.set(false);

            // Auto-hide success message after 3 seconds
            if delete_success() {
                // We'll use a simple timeout instead of tokio::time::sleep
                let start = std::time::Instant::now();
                while start.elapsed().as_secs() < 3 && delete_success() {
                    // Small delay to avoid busy waiting
                    std::thread::sleep(std::time::Duration::from_millis(100));
                }
                delete_success.set(false);
            }
        });
    };

    rsx! {
        div {
            // Page header
            div { class: "flex justify-between items-center mb-6",
                div {
                    h1 { class: "text-3xl font-bold", "Posts" }
                    p { class: "text-gray-400 mt-1", "Manage your blog posts" }
                }

                Link {
                    to: Route::NewPost {},
                    class: "px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all flex items-center shadow-md hover:shadow-lg hover:translate-y-[-1px]",
                    span { class: "mr-1.5", "📝" }
                    "New Post"
                }
            }

            // Filters and search
            div { class: "bg-gray-800 rounded-lg p-5 mb-6 shadow-md border border-gray-700",
                div { class: "flex flex-col md:flex-row gap-4",
                    // Filter tabs
                    div { class: "flex space-x-1 bg-gray-700 rounded-lg p-1",
                        button {
                            class: format!("px-4 py-2 text-sm rounded-lg transition-all font-medium flex items-center {}",
                                  if filter() == "all" { "bg-indigo-600 text-white shadow-sm" } else { "text-gray-300 hover:text-white hover:bg-gray-600" }),
                            onclick: move |_| filter.set("all".to_string()),
                            span { class: "mr-1.5 text-xs", if filter() == "all" { "📁" } else { "" } }
                            "All"
                        }
                        button {
                            class: format!("px-4 py-2 text-sm rounded-lg transition-all font-medium flex items-center {}",
                                  if filter() == "published" { "bg-indigo-600 text-white shadow-sm" } else { "text-gray-300 hover:text-white hover:bg-gray-600" }),
                            onclick: move |_| filter.set("published".to_string()),
                            span { class: "mr-1.5 text-xs", if filter() == "published" { "💬" } else { "" } }
                            "Published"
                        }
                        button {
                            class: format!("px-4 py-2 text-sm rounded-lg transition-all font-medium flex items-center {}",
                                  if filter() == "drafts" { "bg-indigo-600 text-white shadow-sm" } else { "text-gray-300 hover:text-white hover:bg-gray-600" }),
                            onclick: move |_| filter.set("drafts".to_string()),
                            span { class: "mr-1.5 text-xs", if filter() == "drafts" { "📝" } else { "" } }
                            "Drafts"
                        }
                    }

                    // Search
                    div { class: "flex-1",
                        div { class: "relative",
                            span { class: "absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400", "🔍" }
                            input {
                                class: "w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white shadow-inner",
                                r#type: "text",
                                placeholder: "Search posts...",
                                value: "{search_query}",
                                oninput: move |e| search_query.set(e.value())
                            }
                        }
                    }
                }
            }

            // Status messages
            if delete_success() {
                div { class: "bg-green-900/30 border border-green-500/50 text-green-200 px-4 py-3 rounded-lg mb-4 flex items-center shadow-md",
                    span { class: "mr-2 text-green-400", "✔" }
                    "Post deleted successfully."
                }
            }

            if let Some(error) = delete_error() {
                div { class: "bg-red-900/30 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg mb-4 flex items-center shadow-md",
                    span { class: "mr-2 text-red-400", "⚠" }
                    "{error}"
                }
            }

            // Posts list
            div { class: "space-y-4",
                match posts().as_ref() {
                    None => {
                        rsx! {
                            // Loading state
                            div { class: "animate-pulse space-y-4",
                                for _ in 0..3 {
                                    div { class: "bg-gray-800 h-32 rounded-md" }
                                }
                            }
                        }
                    }
                    Some(_) if filtered_posts().is_empty() => {
                        rsx! {
                            div { class: "text-center py-16 bg-gray-800 rounded-lg border border-dashed border-gray-700 shadow-md",
                                div { class: "text-4xl mb-4 text-gray-600", "📄" }
                                if !search_query().is_empty() {
                                    p { class: "text-gray-400 text-lg", "No posts match your search criteria." }
                                } else if filter() == "published" {
                                    p { class: "text-gray-400 text-lg", "No published posts yet." }
                                } else if filter() == "drafts" {
                                    p { class: "text-gray-400 text-lg", "No draft posts." }
                                } else {
                                    p { class: "text-gray-400 text-lg", "No posts yet. Create your first post!" }
                                }

                                if filter() != "all" || !search_query().is_empty() {
                                    button {
                                        class: "mt-4 px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-all inline-flex items-center",
                                        onclick: move |_| {
                                            filter.set("all".to_string());
                                            search_query.set("".to_string());
                                        },
                                        span { class: "mr-1.5", "↻" }
                                        "Reset filters"
                                    }
                                }
                            }
                        }
                    }
                    Some(_) => {
                        rsx! {
                            for post in filtered_posts() {
                                div { key: post.id,
                                    PostCard {
                                        post: post.clone(),
                                        on_delete: Some(EventHandler::new(move |id| handle_delete(id)))
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
