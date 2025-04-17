use dioxus::prelude::*;
use crate::routes::Route;
use crate::utils::{get_post_by_id_server, delete_post_server, update_post_server, format_relative_time};

#[component]
pub fn PostDetail(id: usize) -> Element {
    let mut post = use_resource(move || async move {
        get_post_by_id_server(id).await.unwrap_or(None)
    });

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
                    class: "btn btn-sm btn-secondary flex items-center transition-all",
                    span { "←" }
                    span { class: "ml-1", "Back to Posts" }
                }
            }

            // Post content based on state
            {
                // Use a direct match on post() to avoid lifetime issues
                match post() {
                    None => rsx! {
                        // Loading or not found state
                        div { class: "card p-8 text-center",
                            if post.read().is_none() {
                                div { class: "animate-pulse space-y-4",
                                    div { class: "h-8 bg-gray-700 rounded w-3/4 mx-auto" }
                                    div { class: "h-4 bg-gray-700 rounded w-1/4 mx-auto" }
                                    div { class: "h-32 bg-gray-700 rounded mt-8" }
                                }
                            } else {
                                h1 { class: "text-2xl font-bold text-red-400", "Post Not Found" }
                                p { class: "text-gray-400 mt-2", "The post you're looking for doesn't exist or has been deleted." }
                                div { class: "mt-6",
                                    Link {
                                        to: Route::Posts {},
                                        class: "btn btn-md btn-primary",
                                        "Return to Posts"
                                    }
                                }
                            }
                        }
                    },
                    Some(post_data) => {
                        // Clone the post to avoid lifetime issues
                        let post = post_data.clone().unwrap();
                        rsx! {
                            // Status messages
                            if let Some(error) = delete_error() {
                                div { class: "bg-red-900/30 border border-red-500/50 text-red-200 px-4 py-3 rounded-md mb-4 shadow-md flex items-center",
                                    span { class: "mr-2 text-red-400", "⚠" }
                                    "{error}"
                                }
                            }

                            if let Some(error) = publish_error() {
                                div { class: "bg-red-900/30 border border-red-500/50 text-red-200 px-4 py-3 rounded-md mb-4 shadow-md flex items-center",
                                    span { class: "mr-2 text-red-400", "⚠" }
                                    "{error}"
                                }
                            }

                            if delete_success() {
                                div { class: "bg-green-900/30 border border-green-500/50 text-green-200 px-4 py-3 rounded-md mb-4 shadow-md flex items-center",
                                    span { class: "mr-2 text-green-400", "✔" }
                                    "Post deleted successfully! Redirecting..."
                                }
                            }

                            // Post header
                            div { class: "card p-6 mb-6",
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
                                            "badge badge-success"
                                        } else {
                                            "badge badge-warning"
                                        },
                                        {if post.published { "Published" } else { "Draft" }}
                                    }
                                }

                                // Post metadata
                                div { class: "flex flex-wrap gap-4 mt-4",
                                    if let Some(category) = &post.category {
                                        div { class: "flex items-center",
                                            span { class: "text-gray-400 mr-1", "Category:" }
                                            span { class: "badge badge-info", "{category}" }
                                        }
                                    }

                                    if !post.tags.is_empty() {
                                        div { class: "flex items-center flex-wrap gap-1",
                                            span { class: "text-gray-400 mr-1", "Tags:" }
                                            {post.tags.iter().map(|tag| {
                                                rsx! {
                                                    span { class: "inline-flex items-center px-2.5 py-0.5 m-0.5 rounded-full text-xs font-medium bg-indigo-900/50 text-indigo-200 border border-indigo-700/50 hover:bg-indigo-800/50 transition-colors", "#{tag}" }
                                                }
                                            })}
                                        }
                                    }
                                }

                                // Action buttons
                                div { class: "flex flex-wrap gap-2 mt-6 pt-4 border-t border-gray-700",
                                    Link {
                                        to: Route::EditPost { id: post.id },
                                        class: "btn btn-md btn-primary flex items-center p-2",
                                        span { class: "mr-1 text-xs", "✏️" }
                                        "Edit Post"
                                    }

                                    button {
                                        class: if post.published {
                                            "btn btn-md btn-warning disabled:opacity-50 flex items-center"
                                        } else {
                                            "btn btn-md btn-success disabled:opacity-50 flex items-center"
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
                                        class: "btn btn-md btn-danger disabled:opacity-50 flex items-center",
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
                            div { class: "card p-6",
                                div { class: "card-body prose prose-invert max-w-none",
                                    // Split paragraphs and render them
                                    for paragraph in post.body.split("\n\n") {
                                        if paragraph.trim().is_empty() {
                                            br {}
                                        } else {
                                            p { "{paragraph}" }
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
}
