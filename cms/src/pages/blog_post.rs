use dioxus::prelude::*;
use crate::routes::Route;
use crate::utils::{get_post_by_id_server, format_date};

#[component]
pub fn BlogPost(id: usize) -> Element {
    let post = use_resource(move || async move {
        get_post_by_id_server(id).await.unwrap_or(None)
    });

    // Use the imported format_date function from utils

    rsx! {
        div { class: "max-w-4xl mx-auto",
            // Back button
            div { class: "mb-6",
                Link {
                    to: Route::Blog {},
                    class: "btn btn-sm btn-secondary flex items-center transition-all",
                    span { "←" }
                    span { class: "ml-1", "Back to Blog" }
                }
            }

            // Content based on post state
            {
                match post().as_ref() {
                    None => {
                        rsx! {
                            div { class: "card p-8 text-center",
                                if post.read().is_none() {
                                    div { class: "animate-pulse space-y-4",
                                        div { class: "h-8 bg-gray-700 rounded w-3/4 mx-auto" }
                                        div { class: "h-4 bg-gray-700 rounded w-1/4 mx-auto" }
                                        div { class: "h-32 bg-gray-700 rounded mt-8" }
                                    }
                                } else {
                                    h1 { class: "text-2xl font-bold text-red-400", "Post Not Found" }
                                    p { class: "text-gray-400 mt-2", "The post you're looking for doesn't exist, has been deleted, or is not published." }
                                    div { class: "mt-6",
                                        Link {
                                            to: Route::Blog {},
                                            class: "btn btn-md btn-primary",
                                            "Return to Blog"
                                        }
                                    }
                                }
                            }
                        }
                    }
                    Some(post_data) => {
                        let post = post_data.clone().unwrap();
                        if !post.published {
                            rsx! {
                                div { class: "card p-8 text-center",
                                    h1 { class: "text-2xl font-bold text-yellow-400", "Post Not Available" }
                                    p { class: "text-gray-400 mt-2", "This post is currently not published and cannot be viewed." }
                                    div { class: "mt-6",
                                        Link {
                                            to: Route::Blog {},
                                            class: "btn btn-md btn-primary",
                                            "Return to Blog"
                                        }
                                    }
                                }
                            }
                        } else {
                            rsx! {
                                article { class: "card p-8 shadow-lg",
                                    // Post header
                                    header { class: "card-header mb-8 pb-4 border-b border-gray-700",
                                        h1 { class: "text-3xl md:text-4xl font-bold", "{post.title}" }

                                        div { class: "mt-4 text-gray-400",
                                            time { "Published on {format_date(post.created_at)}" }

                                            if post.updated_at > post.created_at {
                                                span { class: "mx-2", "•" }
                                                time { "Updated on {format_date(post.updated_at)}" }
                                            }
                                        }

                                        // Categories and tags
                                        div { class: "flex flex-wrap gap-2 mt-4",
                                            if let Some(category) = &post.category {
                                                Link {
                                                    to: Route::Blog {},
                                                    class: "inline-flex items-center px-2.5 py-0.5 m-0.5 rounded-full text-xs font-medium bg-blue-900/70 text-blue-200 border border-blue-700/50 hover:bg-blue-800/70 transition-colors",
                                                    "{category}"
                                                }
                                            }

                                            for tag in &post.tags {
                                                Link {
                                                    to: Route::Blog {},
                                                    class: "inline-flex items-center px-2.5 py-0.5 m-0.5 rounded-full text-xs font-medium bg-indigo-900/50 text-indigo-200 border border-indigo-700/50 hover:bg-indigo-800/50 transition-colors",
                                                    "#{tag}"
                                                }
                                            }
                                        }
                                    }

                                    // Post content
                                    div { class: "card-body prose prose-invert prose-lg max-w-none",
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
}
