use dioxus::prelude::*;
use crate::components::StatsCard;
use crate::routes::Route;
use crate::utils::get_stats_server;

#[component]
pub fn Dashboard() -> Element {
    let stats = use_resource(|| async move {
        get_stats_server().await.ok()
    });

    let recent_posts = use_resource(|| async move {
        crate::utils::get_posts_server().await.unwrap_or_default()
    });

    rsx! {
        div { class: "container mx-auto px-4 py-6 max-w-6xl",
            // Page header
            div { class: "mb-8 text-center",
                h1 { class: "text-3xl font-bold", "Dashboard" }
                p { class: "text-gray-400 mt-1", "Overview of your content management system" }
            }

            // Stats cards section - using grid layout
            div { class: "grid grid-cols-2 gap-4 mb-8",
                // First row
                div { class: "col-span-1",
                    match stats().as_ref() {
                        None => rsx! { div { class: "bg-gray-800 rounded-lg p-4 h-24 animate-pulse" } },
                        Some(stats) => rsx! {
                            StatsCard {
                                title: "Total Posts".to_string(),
                                value: stats.as_ref().map_or("0".to_string(), |s| s.total_posts.to_string()),
                                icon: "📝".to_string(),
                                color: "blue".to_string(),
                                change: None,
                            }
                        }
                    }
                }
                div { class: "col-span-1",
                    match stats().as_ref() {
                        None => rsx! { div { class: "bg-gray-800 rounded-lg p-4 h-24 animate-pulse" } },
                        Some(stats) => rsx! {
                            StatsCard {
                                title: "Published Posts".to_string(),
                                value: stats.as_ref().map_or("0".to_string(), |s| s.published_posts.to_string()),
                                icon: "🌐".to_string(),
                                color: "green".to_string(),
                                change: None,
                            }
                        }
                    }
                }

                // Second row
                div { class: "col-span-1",
                    match stats().as_ref() {
                        None => rsx! { div { class: "bg-gray-800 rounded-lg p-4 h-24 animate-pulse" } },
                        Some(stats) => rsx! {
                            StatsCard {
                                title: "Draft Posts".to_string(),
                                value: stats.as_ref().map_or("0".to_string(), |s| s.draft_posts.to_string()),
                                icon: "📋".to_string(),
                                color: "yellow".to_string(),
                                change: None,
                            }
                        }
                    }
                }
                div { class: "col-span-1",
                    match stats().as_ref() {
                        None => rsx! { div { class: "bg-gray-800 rounded-lg p-4 h-24 animate-pulse" } },
                        Some(stats) => rsx! {
                            StatsCard {
                                title: "Categories".to_string(),
                                value: stats.as_ref().map_or("0".to_string(), |s| s.unique_categories.to_string()),
                                icon: "🏷️".to_string(),
                                color: "purple".to_string(),
                                change: None,
                            }
                        }
                    }
                }
            }

            // Two column layout for remaining content using grid
            div { class: "grid grid-cols-1 md:grid-cols-2 gap-6",
                // Quick actions
                div { class: "col-span-1",
                    div { class: "card p-6",
                        div { class: "card-header mb-4 text-center",
                            h2 { class: "text-xl font-bold", "Quick Actions" }
                        }

                        div { class: "card-body",
                            div { class: "grid grid-cols-2 gap-4",
                                // Create Post
                                Link {
                                    to: Route::NewPost {},
                                    class: "bg-blue-600 hover:bg-blue-700 text-white rounded-lg p-4 text-center transition-all shadow-md hover:shadow-lg flex flex-col items-center justify-center aspect-square",
                                    span { class: "text-2xl mb-2", "📝" }
                                    span { class: "text-sm font-medium", "Create Post" }
                                }

                                // Manage Posts
                                Link {
                                    to: Route::Posts {},
                                    class: "bg-gray-700 hover:bg-gray-600 text-white rounded-lg p-4 text-center transition-all shadow-md hover:shadow-lg flex flex-col items-center justify-center aspect-square",
                                    span { class: "text-2xl mb-2", "📋" }
                                    span { class: "text-sm font-medium", "Manage Posts" }
                                }

                                // Manage Users
                                Link {
                                    to: Route::Users {},
                                    class: "bg-gray-700 hover:bg-gray-600 text-white rounded-lg p-4 text-center transition-all shadow-md hover:shadow-lg flex flex-col items-center justify-center aspect-square",
                                    span { class: "text-2xl mb-2", "👥" }
                                    span { class: "text-sm font-medium", "Manage Users" }
                                }

                                // View Blog
                                Link {
                                    to: Route::Blog {},
                                    class: "bg-gray-700 hover:bg-gray-600 text-white rounded-lg p-4 text-center transition-all shadow-md hover:shadow-lg flex flex-col items-center justify-center aspect-square",
                                    span { class: "text-2xl mb-2", "🌐" }
                                    span { class: "text-sm font-medium", "View Blog" }
                                }
                            }
                        }
                    }
                }

                // Recent posts
                div { class: "col-span-1",
                    div { class: "card p-6",
                        div { class: "card-header flex justify-between items-center mb-4",
                            h2 { class: "text-xl font-bold text-center flex-grow", "Recent Posts" }

                            Link {
                                to: Route::Posts {},
                                class: "text-blue-400 hover:text-blue-300 text-sm transition-all",
                                "View All →"
                            }
                        }

                        div { class: "card-body",
                            match recent_posts().as_ref() {
                                None => {
                                    rsx! {
                                        // Loading state
                                        div { class: "animate-pulse space-y-4",
                                            for _ in 0..3 {
                                                div { class: "bg-gray-700 h-16 rounded-lg" }
                                            }
                                        }
                                    }
                                }
                                Some(posts) if posts.is_empty() => {
                                    rsx! {
                                        div { class: "text-center py-8 text-gray-400 border border-dashed border-gray-700 rounded-lg mx-auto",
                                            "No posts yet. Create your first post!"
                                        }
                                    }
                                }
                                Some(posts) => {
                                    rsx! {
                                        div { class: "space-y-4 mx-auto",
                                            for post in posts.iter().take(5) {
                                                div {
                                                    class: "bg-gray-700 p-3 rounded-lg flex justify-between items-center shadow-md transition-all hover:shadow-lg mx-auto",
                                                    key: post.id,

                                                    div { class: "flex-1 min-w-0",
                                                        div { class: "flex items-center",
                                                            h3 { class: "font-medium text-white truncate", "{post.title}" }
                                                            span {
                                                                class: if post.published {
                                                                    "badge badge-success ml-2"
                                                                } else {
                                                                    "badge badge-warning ml-2"
                                                                },
                                                                {if post.published { "Published" } else { "Draft" }}
                                                            }
                                                        }
                                                        p { class: "text-gray-400 text-sm truncate", "{post.body}" }
                                                    }

                                                    Link {
                                                        to: Route::PostDetail { id: post.id },
                                                        class: "btn btn-sm btn-primary ml-4",
                                                        "View"
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
    }
}
