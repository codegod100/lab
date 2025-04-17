use dioxus::prelude::*;
use crate::models::Post;
use crate::routes::Route;
use crate::utils::get_published_posts_server;
use std::collections::HashSet;

#[component]
pub fn Blog() -> Element {
    let posts = use_resource(|| async move {
        get_published_posts_server().await.unwrap_or_default()
    });
    
    let mut selected_category = use_signal(|| None::<String>);
    let mut selected_tag = use_signal(|| None::<String>);
    
    let filtered_posts = move || {
        let posts = match posts().as_ref() {
            Some(p) => p,
            None => return vec![],
        };
        
        posts.iter()
            .filter(|post| {
                if let Some(category) = &selected_category() {
                    if post.category.as_ref() != Some(category) {
                        return false;
                    }
                }
                
                if let Some(tag) = &selected_tag() {
                    if !post.tags.contains(tag) {
                        return false;
                    }
                }
                
                true
            })
            .cloned()
            .collect::<Vec<_>>()
    };
    
    let all_categories = move || {
        let posts = match posts().as_ref() {
            Some(p) => p,
            None => return vec![],
        };
        
        posts.iter()
            .filter_map(|p| p.category.clone())
            .collect::<HashSet<_>>()
            .into_iter()
            .collect::<Vec<_>>()
    };
    
    let all_tags = move || {
        let posts = match posts().as_ref() {
            Some(p) => p,
            None => return vec![],
        };
        
        posts.iter()
            .flat_map(|p| p.tags.clone())
            .collect::<HashSet<_>>()
            .into_iter()
            .collect::<Vec<_>>()
    };
    
    let format_date = |timestamp: u64| -> String {
        let datetime = chrono::NaiveDateTime::from_timestamp_opt(timestamp as i64, 0).unwrap();
        datetime.format("%B %d, %Y").to_string()
    };
    
    rsx! {
        div { class: "max-w-6xl mx-auto",
            // Blog header
            div { class: "text-center mb-12",
                h1 { class: "text-4xl font-bold mb-4", "Blog" }
                p { class: "text-xl text-gray-400", "Latest articles and updates" }
            }
            
            // Main content area with sidebar
            div { class: "flex flex-col md:flex-row gap-8",
                // Sidebar
                div { class: "md:w-1/4",
                    div { class: "bg-gray-800 rounded-lg p-6 sticky top-4",
                        // Categories
                        div { class: "mb-6",
                            h3 { class: "text-lg font-bold mb-3 border-b border-gray-700 pb-2", "Categories" }
                            
                            div { class: "space-y-2",
                                button {
                                    class: "text-sm " + if selected_category().is_none() { "text-blue-400" } else { "text-gray-400 hover:text-white" },
                                    onclick: move |_| selected_category.set(None),
                                    "All Categories"
                                }
                                
                                {all_categories().into_iter().map(|category| {
                                    let is_selected = selected_category() == Some(category.clone());
                                    rsx! {
                                        button {
                                            class: "block text-sm " + if is_selected { "text-blue-400" } else { "text-gray-400 hover:text-white" },
                                            onclick: move |_| {
                                                if is_selected {
                                                    selected_category.set(None);
                                                } else {
                                                    selected_category.set(Some(category.clone()));
                                                }
                                            },
                                            "{category}"
                                        }
                                    }
                                })}
                            }
                        }
                        
                        // Tags
                        div {
                            h3 { class: "text-lg font-bold mb-3 border-b border-gray-700 pb-2", "Tags" }
                            
                            div { class: "flex flex-wrap gap-2",
                                {all_tags().into_iter().map(|tag| {
                                    let is_selected = selected_tag() == Some(tag.clone());
                                    rsx! {
                                        button {
                                            class: "px-2 py-1 text-xs rounded-md " + 
                                                  if is_selected { 
                                                      "bg-blue-600 text-white" 
                                                  } else { 
                                                      "bg-gray-700 text-gray-300 hover:bg-gray-600" 
                                                  },
                                            onclick: move |_| {
                                                if is_selected {
                                                    selected_tag.set(None);
                                                } else {
                                                    selected_tag.set(Some(tag.clone()));
                                                }
                                            },
                                            "#{tag}"
                                        }
                                    }
                                })}
                            }
                        }
                    }
                }
                
                // Main content
                div { class: "md:w-3/4",
                    // Filter indicators
                    if selected_category().is_some() || selected_tag().is_some() {
                        rsx! {
                            div { class: "flex items-center mb-4 text-sm",
                                span { class: "text-gray-400 mr-2", "Filtered by:" }
                                
                                if let Some(category) = &selected_category() {
                                    rsx! {
                                        div { class: "flex items-center bg-blue-900/30 text-blue-200 px-2 py-1 rounded-md mr-2",
                                            span { "Category: {category}" }
                                            button {
                                                class: "ml-2 text-blue-300 hover:text-blue-100",
                                                onclick: move |_| selected_category.set(None),
                                                "×"
                                            }
                                        }
                                    }
                                }
                                
                                if let Some(tag) = &selected_tag() {
                                    rsx! {
                                        div { class: "flex items-center bg-blue-900/30 text-blue-200 px-2 py-1 rounded-md",
                                            span { "Tag: #{tag}" }
                                            button {
                                                class: "ml-2 text-blue-300 hover:text-blue-100",
                                                onclick: move |_| selected_tag.set(None),
                                                "×"
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                    
                    // Posts
                    div { class: "space-y-8",
                        match posts().as_ref() {
                            None => {
                                rsx! {
                                    // Loading state
                                    div { class: "animate-pulse space-y-8",
                                        (0..3).map(|_| {
                                            rsx! {
                                                div { class: "bg-gray-800 rounded-lg p-6",
                                                    div { class: "h-7 bg-gray-700 rounded w-3/4 mb-4" }
                                                    div { class: "h-4 bg-gray-700 rounded w-1/4 mb-6" }
                                                    div { class: "h-4 bg-gray-700 rounded w-full mb-3" }
                                                    div { class: "h-4 bg-gray-700 rounded w-full mb-3" }
                                                    div { class: "h-4 bg-gray-700 rounded w-2/3" }
                                                }
                                            }
                                        })
                                    }
                                }
                            }
                            Some(_) if filtered_posts().is_empty() => {
                                rsx! {
                                    div { class: "bg-gray-800 rounded-lg p-8 text-center",
                                        if selected_category().is_some() || selected_tag().is_some() {
                                            rsx! {
                                                h3 { class: "text-xl font-bold mb-2", "No matching posts found" }
                                                p { class: "text-gray-400", "Try changing your filter criteria." }
                                            }
                                        } else {
                                            rsx! {
                                                h3 { class: "text-xl font-bold mb-2", "No posts yet" }
                                                p { class: "text-gray-400", "Check back later for new content." }
                                            }
                                        }
                                    }
                                }
                            }
                            Some(_) => {
                                rsx! {
                                    filtered_posts().into_iter().map(|post| {
                                        rsx! {
                                            article { 
                                                class: "bg-gray-800 rounded-lg p-6 shadow-lg",
                                                key: post.id,
                                                
                                                // Post header
                                                div { class: "mb-4",
                                                    Link {
                                                        to: Route::BlogPost { id: post.id },
                                                        class: "block",
                                                        h2 { class: "text-2xl font-bold hover:text-blue-400 transition-colors", "{post.title}" }
                                                    }
                                                    
                                                    div { class: "text-sm text-gray-400 mt-1",
                                                        span { "{format_date(post.created_at)}" }
                                                    }
                                                }
                                                
                                                // Post content preview
                                                div { class: "mb-4",
                                                    p { class: "text-gray-300",
                                                        // Show a preview of the content
                                                        if post.body.len() > 200 {
                                                            "{post.body[..200].to_string()}..."
                                                        } else {
                                                            "{post.body}"
                                                        }
                                                    }
                                                }
                                                
                                                // Post footer
                                                div { class: "flex justify-between items-center",
                                                    // Categories and tags
                                                    div { class: "flex flex-wrap gap-2",
                                                        if let Some(category) = &post.category {
                                                            button {
                                                                class: "px-2 py-1 text-xs rounded-md bg-blue-900 text-blue-200",
                                                                onclick: move |_| selected_category.set(Some(category.clone())),
                                                                "{category}"
                                                            }
                                                        }
                                                        
                                                        {post.tags.iter().map(|tag| {
                                                            let tag_clone = tag.clone();
                                                            rsx! {
                                                                button {
                                                                    class: "px-2 py-1 text-xs rounded-md bg-gray-700 text-gray-300",
                                                                    onclick: move |_| selected_tag.set(Some(tag_clone.clone())),
                                                                    "#{tag}"
                                                                }
                                                            }
                                                        })}
                                                    }
                                                    
                                                    // Read more link
                                                    Link {
                                                        to: Route::BlogPost { id: post.id },
                                                        class: "text-blue-400 hover:text-blue-300",
                                                        "Read more →"
                                                    }
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
    }
}
