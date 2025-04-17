use dioxus::prelude::*;
use crate::components::PostCard;
use crate::models::Post;
use crate::routes::Route;
use crate::utils::{get_posts_server, delete_post_server};

#[component]
pub fn Posts() -> Element {
    let posts = use_resource(|| async move {
        get_posts_server().await.unwrap_or_default()
    });
    
    let mut filter = use_signal(|| "all".to_string());
    let mut search_query = use_signal(|| String::new());
    let mut is_deleting = use_signal(|| false);
    let mut delete_error = use_signal(|| None::<String>);
    let mut delete_success = use_signal(|| false);
    
    let filtered_posts = move || {
        let posts = match posts().as_ref() {
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
    
    let handle_delete = move |id: usize| {
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
                tokio::time::sleep(std::time::Duration::from_secs(3)).await;
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
                    class: "px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors",
                    "New Post"
                }
            }
            
            // Filters and search
            div { class: "bg-gray-800 rounded-lg p-4 mb-6",
                div { class: "flex flex-col md:flex-row gap-4",
                    // Filter tabs
                    div { class: "flex space-x-1 bg-gray-700 rounded-md p-1",
                        button {
                            class: "px-3 py-1.5 text-sm rounded-md transition-colors " + 
                                  if filter() == "all" { "bg-gray-600 text-white" } else { "text-gray-300 hover:text-white" },
                            onclick: move |_| filter.set("all".to_string()),
                            "All"
                        }
                        button {
                            class: "px-3 py-1.5 text-sm rounded-md transition-colors " + 
                                  if filter() == "published" { "bg-gray-600 text-white" } else { "text-gray-300 hover:text-white" },
                            onclick: move |_| filter.set("published".to_string()),
                            "Published"
                        }
                        button {
                            class: "px-3 py-1.5 text-sm rounded-md transition-colors " + 
                                  if filter() == "drafts" { "bg-gray-600 text-white" } else { "text-gray-300 hover:text-white" },
                            onclick: move |_| filter.set("drafts".to_string()),
                            "Drafts"
                        }
                    }
                    
                    // Search
                    div { class: "flex-1",
                        div { class: "relative",
                            span { class: "absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400", "🔍" }
                            input {
                                class: "w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white",
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
                div { class: "bg-green-900/30 border border-green-500/50 text-green-200 px-4 py-3 rounded-md mb-4",
                    "Post deleted successfully."
                }
            }
            
            if let Some(error) = delete_error() {
                div { class: "bg-red-900/30 border border-red-500/50 text-red-200 px-4 py-3 rounded-md mb-4",
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
                                (0..3).map(|_| {
                                    rsx! {
                                        div { class: "bg-gray-800 h-32 rounded-md" }
                                    }
                                })
                            }
                        }
                    }
                    Some(_) if filtered_posts().is_empty() => {
                        rsx! {
                            div { class: "text-center py-12 bg-gray-800 rounded-lg border border-dashed border-gray-700",
                                if !search_query().is_empty() {
                                    rsx! { p { class: "text-gray-400", "No posts match your search criteria." } }
                                } else if filter() == "published" {
                                    rsx! { p { class: "text-gray-400", "No published posts yet." } }
                                } else if filter() == "drafts" {
                                    rsx! { p { class: "text-gray-400", "No draft posts." } }
                                } else {
                                    rsx! { p { class: "text-gray-400", "No posts yet. Create your first post!" } }
                                }
                            }
                        }
                    }
                    Some(_) => {
                        rsx! {
                            filtered_posts().into_iter().map(|post| {
                                rsx! {
                                    div { key: post.id,
                                        PostCard {
                                            post: post.clone(),
                                            on_delete: Some(EventHandler::new(move |id| handle_delete(id)))
                                        }
                                    }
                                }
                            })
                        }
                    }
                }
            }
        }
    }
}
