use dioxus::prelude::*;
use crate::routes::Route;
use crate::utils::{get_published_posts_server, format_date};
use std::collections::HashSet;

// Helper function to get post excerpt
fn get_excerpt(html: &str) -> String {
    // First strip HTML tags
    let mut result = String::new();
    let mut in_tag = false;

    for c in html.chars() {
        match c {
            '<' => in_tag = true,
            '>' => in_tag = false,
            _ if !in_tag => result.push(c),
            _ => {}
        }
    }

    // Then limit to 200 characters
    if result.len() <= 200 {
        result
    } else {
        let excerpt: String = result.chars().take(200).collect();
        format!("{excerpt}...")
    }
}

#[component]
pub fn Blog() -> Element {
    // Use use_server_future for posts, matching posts.rs
    let posts_data = use_server_future(get_published_posts_server)?.value();

    let mut search_query = use_signal(|| String::new());
    let mut selected_category = use_signal(|| None::<String>);
    let mut selected_tag = use_signal(|| None::<String>);

    let filtered_posts = move || {
        let posts = match posts_data() {
            Some(Ok(p)) => p,
            _ => return vec![],
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

                if !search_query().is_empty() {
                    let query = search_query().to_lowercase();
                    let title_match = post.title.to_lowercase().contains(&query);
                    let body_match = post.body.to_lowercase().contains(&query);
                    let category_match = post.category.as_ref()
                        .map(|c| c.to_lowercase().contains(&query))
                        .unwrap_or(false);

                    if !(title_match || body_match || category_match) {
                        return false;
                    }
                }

                true
            })
            .cloned()
            .collect::<Vec<_>>()
    };

    let all_categories = move || {
        let posts = match posts_data() {
            Some(Ok(p)) => p,
            _ => return vec![],
        };

        posts.iter()
            .filter_map(|p| p.category.clone())
            .collect::<HashSet<_>>()
            .into_iter()
            .collect::<Vec<_>>()
    };

    let all_tags = move || {
        let posts = match posts_data() {
            Some(Ok(p)) => p,
            _ => return vec![],
        };

        posts.iter()
            .flat_map(|p| p.tags.clone())
            .collect::<HashSet<_>>()
            .into_iter()
            .collect::<Vec<_>>()
    };

    // Use the imported format_date function from utils

    rsx! {
        div { class: "container mx-auto px-4 py-8",
            h1 { class: "text-4xl font-bold mb-8 text-center", "Blog" }

            // Search and filters
            div { class: "bg-gray-800 rounded-lg p-6 mb-8",
                // Search
                div { class: "mb-6",
                    label { class: "block text-sm font-medium text-gray-300 mb-1", "Search" }
                    div { class: "relative",
                        input {
                            class: "w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white",
                            r#type: "text",
                            placeholder: "Search posts...",
                            value: "{search_query}",
                            oninput: move |e| search_query.set(e.value())
                        }
                    }
                }

                // Filters
                div { class: "grid grid-cols-1 md:grid-cols-2 gap-4",
                    // Categories filter
                    div {
                        label { class: "block text-sm font-medium text-gray-300 mb-1", "Filter by Category" }
                        div { class: "flex flex-wrap gap-2",
                            button {
                                class: if selected_category().is_none() {
                                    "inline-flex items-center px-2.5 py-0.5 m-0.5 rounded-full text-xs font-medium bg-blue-600 text-white border border-blue-500 transition-colors"
                                } else {
                                    "inline-flex items-center px-2.5 py-0.5 m-0.5 rounded-full text-xs font-medium bg-gray-700 text-gray-300 border border-gray-600 hover:bg-gray-600 transition-colors"
                                },
                                onclick: move |_| selected_category.set(None),
                                "All"
                            }

                            {all_categories().into_iter().map(|category| {
                                let is_selected = selected_category().as_ref() == Some(&category);
                                let category_clone = category.clone();

                                rsx! {
                                    button {
                                        key: "{category}",
                                        class: if is_selected {
                                            "inline-flex items-center px-2.5 py-0.5 m-0.5 rounded-full text-xs font-medium bg-blue-600 text-white border border-blue-500 transition-colors"
                                        } else {
                                            "inline-flex items-center px-2.5 py-0.5 m-0.5 rounded-full text-xs font-medium bg-gray-700 text-gray-300 border border-gray-600 hover:bg-gray-600 transition-colors"
                                        },
                                        onclick: move |_| {
                                            if is_selected {
                                                selected_category.set(None)
                                            } else {
                                                selected_category.set(Some(category_clone.clone()))
                                            }
                                        },
                                        "{category}"
                                    }
                                }
                            })}
                        }
                    }

                    // Tags filter
                    div {
                        label { class: "block text-sm font-medium text-gray-300 mb-1", "Filter by Tag" }
                        div { class: "flex flex-wrap gap-2",
                            button {
                                class: if selected_tag().is_none() {
                                    "inline-flex items-center px-2.5 py-0.5 m-0.5 rounded-full text-xs font-medium bg-indigo-600 text-white border border-indigo-500 transition-colors"
                                } else {
                                    "inline-flex items-center px-2.5 py-0.5 m-0.5 rounded-full text-xs font-medium bg-gray-700 text-gray-300 border border-gray-600 hover:bg-gray-600 transition-colors"
                                },
                                onclick: move |_| selected_tag.set(None),
                                "All"
                            }

                            {all_tags().into_iter().map(|tag| {
                                let is_selected = selected_tag().as_ref() == Some(&tag);
                                let tag_clone = tag.clone();

                                rsx! {
                                    button {
                                        key: "{tag}",
                                        class: if is_selected {
                                            "inline-flex items-center px-2.5 py-0.5 m-0.5 rounded-full text-xs font-medium bg-indigo-600 text-white border border-indigo-500 transition-colors"
                                        } else {
                                            "inline-flex items-center px-2.5 py-0.5 m-0.5 rounded-full text-xs font-medium bg-gray-700 text-gray-300 border border-gray-600 hover:bg-gray-600 transition-colors"
                                        },
                                        onclick: move |_| {
                                            if is_selected {
                                                selected_tag.set(None)
                                            } else {
                                                selected_tag.set(Some(tag_clone.clone()))
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

            // Posts grid
            div { class: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8",
                match posts_data() {
                    None => {
                        rsx! {
                            div { class: "bg-gray-800 rounded-lg p-8 text-center",
                                if posts_data.read().is_none() {
                                    div { class: "animate-pulse grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4",
                                        div { class: "h-8 bg-gray-700 rounded w-1/4 mx-auto" }
                                        div { class: "h-64 bg-gray-700 rounded mt-8" }
                                    }
                                } else {
                                    div {
                                        h2 { class: "text-2xl font-bold text-red-400", "Error Loading Posts" }
                                        p { class: "text-gray-400 mt-2", "There was a problem loading the blog posts. Please try again later." }
                                    }
                                }
                            }
                        }
                    }
                    Some(Err(_)) => {
                        rsx! {
                            div { class: "bg-gray-800 rounded-lg p-8 text-center",
                                h2 { class: "text-2xl font-bold text-red-400", "Error Loading Posts" }
                                p { class: "text-gray-400 mt-2", "There was a problem loading the blog posts. Please try again later." }
                            }
                        }
                    }
                    Some(Ok(posts)) => {
                        let _ = &posts; // suppress unused variable warning
                        rsx! {
                            for post in filtered_posts() {
                                article {
                                    class: "bg-gray-800 rounded-lg p-6 shadow-lg",
                                    key: post.id,

                                    // Post header
                                    header { class: "mb-4",
                                        Link {
                                            to: Route::BlogPost { id: post.id },
                                            class: "block",
                                            h2 { class: "text-2xl font-bold hover:text-blue-400 transition-colors", "{post.title}" }
                                        }

                                        div { class: "text-sm text-gray-400 mt-1",
                                            time { "{format_date(post.created_at)}" }
                                        }
                                    }

                                    // Post excerpt
                                    div { class: "mb-4",
                                        p { class: "text-gray-300 line-clamp-3",
                                            // Get first 200 chars as excerpt
                                            "{get_excerpt(&post.body)}"
                                        }
                                    }

                                    // Post footer
                                    div { class: "flex justify-between items-center",
                                        // Categories and tags
                                        div { class: "flex flex-wrap gap-2",
                                            {post.category.as_ref().map(|category| {
                                                let cat = category.clone();
                                                rsx! {
                                                    button {
                                                        class: "inline-flex items-center px-2.5 py-0.5 m-0.5 rounded-full text-xs font-medium bg-blue-900/70 text-blue-200 border border-blue-700/50 hover:bg-blue-800/70 transition-colors",
                                                        onclick: move |_| selected_category.set(Some(cat.clone())),
                                                        "{category}"
                                                    }
                                                }
                                            })}

                                            {post.tags.iter().map(|tag| {
                                                let tag_clone = tag.clone();
                                                rsx! {
                                                    button {
                                                        key: "{tag}",
                                                        class: "inline-flex items-center px-2.5 py-0.5 m-0.5 rounded-full text-xs font-medium bg-indigo-900/50 text-indigo-200 border border-indigo-700/50 hover:bg-indigo-800/50 transition-colors",
                                                        onclick: move |_| selected_tag.set(Some(tag_clone.clone())),
                                                        "#{tag}"
                                                    }
                                                }
                                            })}
                                        }

                                        // Read more link
                                        Link {
                                            to: Route::BlogPost { id: post.id },
                                            class: "px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md",
                                            "Read More"
                                        }
                                    }
                                }
                            }

                            // No results message
                            if filtered_posts().is_empty() {
                                div { class: "bg-gray-800 rounded-lg p-8 text-center",
                                    h2 { class: "text-2xl font-bold", "No Posts Found" }
                                    p { class: "text-gray-400 mt-2", "No posts match your current filters. Try adjusting your search criteria." }

                                    button {
                                        class: "mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700",
                                        onclick: move |_| {
                                            search_query.set(String::new());
                                            selected_category.set(None);
                                            selected_tag.set(None);
                                        },
                                        "Clear All Filters"
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
