use dioxus::prelude::*;
use crate::models::Post;
use crate::routes::Route;
use std::time::{SystemTime, UNIX_EPOCH};

#[component]
pub fn PostCard(post: Post, on_delete: Option<EventHandler<usize>>) -> Element {
    let formatted_date = format_timestamp(post.updated_at);

    // Create a signal to store the delete handler
    let delete_handler = use_signal(|| on_delete);

    // Create a callback for the delete action
    let post_id = post.id;
    let handle_delete = move |_| {
        if let Some(handler) = delete_handler.read().as_ref() {
            handler.call(post_id);
        }
    };

    rsx! {
        div {
            class: if post.published {
                "bg-gray-800 p-4 rounded-md border-l-4 border-green-500 shadow-md"
            } else {
                "bg-gray-800 p-4 rounded-md border-l-4 border-yellow-500 shadow-md"
            },
            div { class: "flex justify-between items-center mb-2",
                h3 { class: "font-bold text-lg text-white", "{post.title}" }
                span {
                    class: if post.published {
                        "px-2 py-1 text-xs rounded-full bg-green-800 text-green-200"
                    } else {
                        "px-2 py-1 text-xs rounded-full bg-yellow-800 text-yellow-200"
                    },
                    {if post.published { "Published" } else { "Draft" }}
                }
            }

            // Post content preview
            p { class: "text-gray-300 text-sm mb-3 line-clamp-2", "{post.body}" }

            // Post metadata
            div { class: "flex flex-wrap gap-2 mb-3",
                if let Some(category) = &post.category {
                    span { class: "px-2 py-1 text-xs rounded-md bg-blue-900 text-blue-200", "{category}" }
                }

                {post.tags.iter().map(|tag| {
                    rsx! {
                        span { class: "px-2 py-1 text-xs rounded-md bg-gray-700 text-gray-300", "#{tag}" }
                    }
                })}
            }

            // Post footer with actions
            div { class: "flex justify-between items-center mt-2 pt-2 border-t border-gray-700",
                // Date info
                span { class: "text-xs text-gray-400", "Updated {formatted_date}" }

                // Action buttons
                div { class: "flex space-x-2",
                    Link {
                        class: "px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded",
                        to: Route::PostDetail { id: post.id },
                        "View"
                    }
                    Link {
                        class: "px-2 py-1 text-xs bg-gray-600 hover:bg-gray-700 text-white rounded",
                        to: Route::EditPost { id: post.id },
                        "Edit"
                    }
                    // Only show delete button if handler is provided
                    if delete_handler.read().is_some() {
                        button {
                            class: "px-2 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded",
                            onclick: handle_delete,
                            "Delete"
                        }
                    }
                }
            }
        }
    }
}

fn format_timestamp(timestamp: u64) -> String {
    let now = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_secs();

    let diff = now.saturating_sub(timestamp);

    if diff < 60 {
        "just now".to_string()
    } else if diff < 3600 {
        format!("{} minutes ago", diff / 60)
    } else if diff < 86400 {
        format!("{} hours ago", diff / 3600)
    } else {
        format!("{} days ago", diff / 86400)
    }
}
