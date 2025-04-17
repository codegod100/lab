use dioxus::prelude::*;
use crate::routes::Route;
use crate::utils::get_post_by_id_server;

#[component]
pub fn BlogPost(id: usize) -> Element {
    let post = use_resource(move || async move {
        get_post_by_id_server(id).await.unwrap_or(None)
    });
    
    let format_date = |timestamp: u64| -> String {
        let datetime = chrono::NaiveDateTime::from_timestamp_opt(timestamp as i64, 0).unwrap();
        datetime.format("%B %d, %Y").to_string()
    };
    
    rsx! {
        div { class: "max-w-4xl mx-auto",
            // Back button
            div { class: "mb-6",
                Link {
                    to: Route::Blog {},
                    class: "text-blue-400 hover:text-blue-300 flex items-center",
                    span { "←" }
                    span { class: "ml-1", "Back to Blog" }
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
                                    p { class: "text-gray-400 mt-2", "The post you're looking for doesn't exist, has been deleted, or is not published." }
                                    div { class: "mt-6",
                                        Link {
                                            to: Route::Blog {},
                                            class: "px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700",
                                            "Return to Blog"
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                Some(post) if !post.published => {
                    rsx! {
                        div { class: "bg-gray-800 rounded-lg p-8 text-center",
                            h1 { class: "text-2xl font-bold text-yellow-400", "Post Not Available" }
                            p { class: "text-gray-400 mt-2", "This post is currently not published and cannot be viewed." }
                            div { class: "mt-6",
                                Link {
                                    to: Route::Blog {},
                                    class: "px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700",
                                    "Return to Blog"
                                }
                            }
                        }
                    }
                }
                Some(post) => {
                    rsx! {
                        article { class: "bg-gray-800 rounded-lg p-8 shadow-lg",
                            // Post header
                            header { class: "mb-8",
                                h1 { class: "text-3xl md:text-4xl font-bold", "{post.title}" }
                                
                                div { class: "mt-4 text-gray-400",
                                    time { "Published on {format_date(post.created_at)}" }
                                    
                                    if post.updated_at > post.created_at {
                                        rsx! {
                                            span { class: "mx-2", "•" }
                                            time { "Updated on {format_date(post.updated_at)}" }
                                        }
                                    }
                                }
                                
                                // Categories and tags
                                div { class: "flex flex-wrap gap-2 mt-4",
                                    if let Some(category) = &post.category {
                                        rsx! {
                                            Link {
                                                to: Route::Blog {},
                                                class: "px-2 py-1 text-sm rounded-md bg-blue-900 text-blue-200",
                                                "{category}"
                                            }
                                        }
                                    }
                                    
                                    {post.tags.iter().map(|tag| {
                                        rsx! {
                                            Link {
                                                to: Route::Blog {},
                                                class: "px-2 py-1 text-sm rounded-md bg-gray-700 text-gray-300",
                                                "#{tag}"
                                            }
                                        }
                                    })}
                                }
                            }
                            
                            // Post content
                            div { class: "prose prose-invert prose-lg max-w-none",
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
