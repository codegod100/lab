use dioxus::prelude::*;
use crate::models::Post;
use crate::routes::Route;
use crate::utils::{get_post_by_id_server, delete_post_server, update_post_server};
use std::time::{SystemTime, UNIX_EPOCH};

#[component]
pub fn PostDetail(id: usize) -> Element {
    let post = use_resource(move || async move {
        get_post_by_id_server(id).await.unwrap_or(None)
    });
    
    let mut is_deleting = use_signal(|| false);
    let mut delete_error = use_signal(|| None::<String>);
    let mut is_publishing = use_signal(|| false);
    let mut publish_error = use_signal(|| None::<String>);
    
    let navigator = use_navigator();
    
    let handle_delete = move |_| {
        is_deleting.set(true);
        delete_error.set(None);
        
        spawn(async move {
            match delete_post_server(id).await {
                Ok(true) => {
                    navigator.push(Route::Posts {});
                }
                Ok(false) => {
                    delete_error.set(Some("Post not found".to_string()));
                }
                Err(e) => {
                    delete_error.set(Some(format!("Error: {}", e)));
                }
            }
            is_deleting.set(false);
        });
    };
    
    let toggle_publish = move |current_state: bool| {
        is_publishing.set(true);
        publish_error.set(None);
        
        spawn(async move {
            match update_post_server(id, None, None, Some(!current_state), None, None).await {
                Ok(Some(_)) => {
                    post.restart();
                }
                Ok(None) => {
                    publish_error.set(Some("Post not found".to_string()));
                }
                Err(e) => {
                    publish_error.set(Some(format!("Error: {}", e)));
                }
            }
            is_publishing.set(false);
        });
    };
    
    let format_date = |timestamp: u64| -> String {
        let now = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs();
        
        let diff = now.saturating_sub(timestamp);
        
        if diff < 86400 {
            // Less than a day, show relative time
            if diff < 60 {
                "just now".to_string()
            } else if diff < 3600 {
                format!("{} minutes ago", diff / 60)
            } else {
                format!("{} hours ago", diff / 3600)
            }
        } else {
            // More than a day, show date
            let datetime = chrono::NaiveDateTime::from_timestamp_opt(timestamp as i64, 0).unwrap();
            datetime.format("%B %d, %Y").to_string()
        }
    };
    
    rsx! {
        div {
            // Back button
            div { class: "mb-6",
                Link {
                    to: Route::Posts {},
                    class: "text-blue-400 hover:text-blue-300 flex items-center",
                    span { "←" }
                    span { class: "ml-1", "Back to Posts" }
                }
            }
            
            match post().as_ref() {
                None => {
                    rsx! {
                        // Loading or not found state
                        div { class: "bg-gray-800 rounded-lg p-8 text-center",
                            if post.loading() {
                                rsx! {
                                    div { class: "animate-pulse space-y-4",
                                        div { class: "h-8 bg-gray-700 rounded w-3/4 mx-auto" }
                                        div { class: "h-4 bg-gray-700 rounded w-1/4 mx-auto" }
                                        div { class: "h-32 bg-gray-700 rounded mt-8" }
                                    }
                                }
                            } else {
                                rsx! {
                                    h1 { class: "text-2xl font-bold text-red-400", "Post Not Found" }
                                    p { class: "text-gray-400 mt-2", "The post you're looking for doesn't exist or has been deleted." }
                                    div { class: "mt-6",
                                        Link {
                                            to: Route::Posts {},
                                            class: "px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700",
                                            "View All Posts"
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                Some(post) => {
                    rsx! {
                        // Status messages
                        if let Some(error) = delete_error() {
                            div { class: "bg-red-900/30 border border-red-500/50 text-red-200 px-4 py-3 rounded-md mb-4",
                                "{error}"
                            }
                        }
                        
                        if let Some(error) = publish_error() {
                            div { class: "bg-red-900/30 border border-red-500/50 text-red-200 px-4 py-3 rounded-md mb-4",
                                "{error}"
                            }
                        }
                        
                        // Post header
                        div { class: "bg-gray-800 rounded-lg p-6 mb-6",
                            div { class: "flex justify-between items-start",
                                div {
                                    h1 { class: "text-3xl font-bold text-white", "{post.title}" }
                                    
                                    div { class: "flex items-center mt-2 text-sm text-gray-400",
                                        span { "Created {format_date(post.created_at)}" }
                                        if post.updated_at > post.created_at {
                                            rsx! {
                                                span { class: "mx-2", "•" }
                                                span { "Updated {format_date(post.updated_at)}" }
                                            }
                                        }
                                    }
                                }
                                
                                span {
                                    class: if post.published { 
                                        "px-3 py-1 text-sm rounded-full bg-green-800 text-green-200" 
                                    } else { 
                                        "px-3 py-1 text-sm rounded-full bg-yellow-800 text-yellow-200" 
                                    },
                                    {if post.published { "Published" } else { "Draft" }}
                                }
                            }
                            
                            // Post metadata
                            div { class: "flex flex-wrap gap-2 mt-4",
                                if let Some(category) = &post.category {
                                    div { class: "flex items-center",
                                        span { class: "text-gray-400 mr-1", "Category:" }
                                        span { class: "px-2 py-1 text-xs rounded-md bg-blue-900 text-blue-200", "{category}" }
                                    }
                                }
                                
                                if !post.tags.is_empty() {
                                    div { class: "flex items-center flex-wrap gap-1",
                                        span { class: "text-gray-400 mr-1", "Tags:" }
                                        {post.tags.iter().map(|tag| {
                                            rsx! {
                                                span { class: "px-2 py-1 text-xs rounded-md bg-gray-700 text-gray-300", "#{tag}" }
                                            }
                                        })}
                                    }
                                }
                            }
                            
                            // Action buttons
                            div { class: "flex gap-2 mt-6",
                                Link {
                                    to: Route::EditPost { id: post.id },
                                    class: "px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors",
                                    "Edit Post"
                                }
                                
                                button {
                                    class: if post.published {
                                        "px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors disabled:opacity-50"
                                    } else {
                                        "px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
                                    },
                                    disabled: is_publishing,
                                    onclick: move |_| toggle_publish(post.published),
                                    if is_publishing {
                                        "Processing..."
                                    } else if post.published {
                                        "Unpublish"
                                    } else {
                                        "Publish"
                                    }
                                }
                                
                                button {
                                    class: "px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50",
                                    disabled: is_deleting,
                                    onclick: handle_delete,
                                    if is_deleting { "Deleting..." } else { "Delete" }
                                }
                            }
                        }
                        
                        // Post content
                        div { class: "bg-gray-800 rounded-lg p-6",
                            div { class: "prose prose-invert max-w-none",
                                // Split paragraphs and render them
                                {post.body.split("\n\n").map(|paragraph| {
                                    if paragraph.trim().is_empty() {
                                        rsx! { br {} }
                                    } else {
                                        rsx! { p { "{paragraph}" } }
                                    }
                                })}
                            }
                        }
                    }
                }
            }
        }
    }
}
