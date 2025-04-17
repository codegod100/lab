use dioxus::prelude::*;
use crate::routes::Route;
use crate::utils::{get_post_by_id_server, delete_post_server, update_post_server, format_relative_time};

#[component]
pub fn PostDetail(id: usize) -> Element {
    // Use use_server_future for consistency with posts.rs
    let post = use_server_future(move || get_post_by_id_server(id))?.value();

    let mut is_deleting = use_signal(|| false);
    let mut delete_error = use_signal(|| None::<String>);
    let mut delete_success = use_signal(|| false);

    let mut is_publishing = use_signal(|| false);
    let mut publish_error = use_signal(|| None::<String>);

    let navigator = use_navigator();

    // Use the imported format_relative_time function from utils
    let format_date = format_relative_time;

    let mut toggle_publish = move |current_state: bool| {
        is_publishing.set(true);
        publish_error.set(None);

        spawn(async move {
            match update_post_server(id, None, None, Some(!current_state), None, None).await {
                Ok(Some(_)) => {
                    // post.restart(); // Not available with use_server_future
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

    let handle_delete = move |_| {
        is_deleting.set(true);
        delete_error.set(None);
        delete_success.set(false);

        spawn(async move {
            match delete_post_server(id).await {
                Ok(true) => {
                    delete_success.set(true);
                    // Navigate back to posts after a short delay
                    spawn(async move {
                        tokio::time::sleep(tokio::time::Duration::from_millis(1500)).await;
                        navigator.push(Route::Posts {});
                    });
                }
                Ok(false) => {
                    delete_error.set(Some("Post not found".to_string()));
                    is_deleting.set(false);
                }
                Err(e) => {
                    delete_error.set(Some(format!("Error: {}", e)));
                    is_deleting.set(false);
                }
            }
        });
    };

    rsx! {
        div { class: "container mx-auto px-4 py-8 max-w-4xl",
            // Back button
            div { class: "mb-6",
                Link {
                    to: Route::Posts {},
                    class: "inline-flex items-center px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium rounded-lg transition-colors",
                    span { "←" }
                    span { class: "ml-1", "Back to Posts" }
                }
            }

            // Post content based on state
            {
                match post() {
                    Some(Ok(Some(post))) => {
                        rsx! {
                            // Post header
                            div { class: "bg-gray-800 p-6 rounded-lg border border-gray-700 shadow-lg mb-6",
                                div { class: "flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4",
                                    div { class: "flex-1",
                                        h1 { class: "text-3xl font-bold text-white", "{post.title}" }

                                        div { class: "flex flex-wrap items-center mt-2 text-sm text-gray-400",
                                            span { "Created {format_date(post.created_at)}" }
                                            if post.updated_at > post.created_at {
                                                span { class: "mx-2", "•" }
                                                span { "Updated {format_date(post.updated_at)}" }
                                            }
                                        }
                                    }

                                    span {
                                        class: if post.published {
                                            "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-900/50 text-green-200 border border-green-700/50"
                                        } else {
                                            "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-900/50 text-yellow-200 border border-yellow-700/50"
                                        },
                                        {if post.published { "Published" } else { "Draft" }}
                                    }
                                }

                                // Post metadata
                                div { class: "flex flex-wrap gap-4 mt-4",
                                    if let Some(category) = &post.category {
                                        div { class: "flex items-center",
                                            span { class: "text-gray-400 mr-1", "Category:" }
                                            span { class: "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-900/50 text-blue-200 border border-blue-700/50", "{category}" }
                                        }
                                    }

                                    if !post.tags.is_empty() {
                                        div { class: "flex items-center flex-wrap gap-1",
                                            span { class: "text-gray-400 mr-1", "Tags:" }
                                            {post.tags.iter().map(|tag| {
                                                rsx! {
                                                    span { class: "inline-flex items-center px-2.5 py-1 m-0.5 rounded-full text-xs font-medium bg-indigo-900/50 text-indigo-200 border border-indigo-700/50 hover:bg-indigo-800/50 transition-colors", "#{tag}" }
                                                }
                                            })}
                                        }
                                    }
                                }

                                // Action buttons
                                div { class: "flex flex-wrap gap-2 mt-6 pt-4 border-t border-gray-700",
                                    Link {
                                        to: Route::EditPost { id: post.id },
                                        class: "inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors",
                                        span { class: "mr-1 text-xs", "✏️" }
                                        "Edit Post"
                                    }

                                    button {
                                        class: if post.published {
                                            "inline-flex items-center px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        } else {
                                            "inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        },
                                        disabled: is_publishing(),
                                        onclick: move |_| toggle_publish(post.published),
                                        if is_publishing() {
                                            "Processing..."
                                        } else if post.published {
                                            span { class: "mr-1 text-xs", "🔒" }
                                            "Unpublish"
                                        } else {
                                            span { class: "mr-1 text-xs", "🔓" }
                                            "Publish"
                                        }
                                    }

                                    button {
                                        class: "inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
                                        disabled: is_deleting(),
                                        onclick: handle_delete,
                                        if is_deleting() {
                                            "Deleting..."
                                        } else {
                                            span { class: "mr-1 text-xs", "🗑️" }
                                            "Delete"
                                        }
                                    }
                                }
                            }

                            // Post content
                            div { class: "bg-gray-800 p-6 rounded-lg border border-gray-700 shadow-lg",
                                div { class: "text-gray-200 max-w-none prose prose-invert prose-lg",
                                    // Render HTML content
                                    dangerous_inner_html: "{post.body}"
                                }
                            }
                        }
                    }
                    Some(Ok(None)) => rsx! {
                        div { class: "bg-gray-800 p-8 rounded-lg border border-gray-700 shadow-lg text-center",
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
                    },
                    Some(Err(_)) => rsx! {
                        div { class: "bg-gray-800 p-8 rounded-lg border border-gray-700 shadow-lg text-center",
                            h1 { class: "text-2xl font-bold text-red-400", "Error Loading Post" },
                            p { class: "text-gray-400 mt-2", "There was a problem loading the post. Please try again later." },
                        }
                    },
                    None => rsx! {
                        div { class: "bg-gray-800 p-8 rounded-lg border border-gray-700 shadow-lg text-center",
                            div { class: "animate-pulse space-y-4",
                                div { class: "h-8 bg-gray-700 rounded w-3/4 mx-auto" }
                                div { class: "h-4 bg-gray-700 rounded w-1/4 mx-auto" }
                                div { class: "h-32 bg-gray-700 rounded mt-8" }
                            }
                        }
                    },
                }
            }
        }
    }
}
