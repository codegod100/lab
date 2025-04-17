use dioxus::prelude::*;
use crate::models::Post;
use crate::routes::Route;
use crate::utils::format_relative_time;

#[component]
pub fn PostCard(post: Post, on_delete: Option<EventHandler<usize>>) -> Element {
    let formatted_date = format_relative_time(post.updated_at);

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
                "card p-5 border-l-4 border-green-500 shadow-md transition-all hover:shadow-lg hover:translate-y-[-2px]"
            } else {
                "card p-5 border-l-4 border-yellow-500 shadow-md transition-all hover:shadow-lg hover:translate-y-[-2px]"
            },
            div { class: "flex justify-between items-center mb-3",
                h3 { class: "font-bold text-lg text-white", "{post.title}" }
                span {
                    class: if post.published {
                        "badge badge-success flex items-center"
                    } else {
                        "badge badge-warning flex items-center"
                    },
                    span { class: "mr-1 text-xs", if post.published { "●" } else { "○" } }
                    {if post.published { "Published" } else { "Draft" }}
                }
            }

            // Post content preview
            p { class: "text-gray-300 text-sm mb-4 line-clamp-2", "{post.body}" }

            // Post metadata
            div { class: "flex flex-wrap gap-2 mb-4",
                if let Some(category) = &post.category {
                    span { class: "badge badge-info flex items-center",
                        span { class: "mr-1 opacity-70", "📂" }
                        "{category}"
                    }
                }

                {post.tags.iter().map(|tag| {
                    rsx! {
                        span { class: "px-2 py-1 text-xs rounded-md bg-gray-700 text-gray-300 border border-gray-600", "#{tag}" }
                    }
                })}
            }

            // Post footer with actions
            div { class: "flex justify-between items-center mt-3 pt-3 border-t border-gray-700",
                // Date info
                span { class: "text-xs text-gray-400 flex items-center",
                    span { class: "mr-1 opacity-70", "🕒" }
                    "Updated {formatted_date}"
                }

                // Action buttons
                div { class: "flex space-x-2",
                    Link {
                        class: "btn btn-sm btn-primary flex items-center",
                        to: Route::PostDetail { id: post.id },
                        span { class: "mr-1 text-xs", "👁️" }
                        "View"
                    }
                    Link {
                        class: "btn btn-sm btn-secondary flex items-center",
                        to: Route::EditPost { id: post.id },
                        span { class: "mr-1 text-xs", "✏️" }
                        "Edit"
                    }
                    // Only show delete button if handler is provided
                    if delete_handler.read().is_some() {
                        button {
                            class: "btn btn-sm btn-danger flex items-center",
                            onclick: handle_delete,
                            span { class: "mr-1 text-xs", "🗑️" }
                            "Delete"
                        }
                    }
                }
            }
        }
    }
}

// Using the imported format_relative_time function from utils
