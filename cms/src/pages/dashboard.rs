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
        div {
            // Page header
            div { class: "mb-6",
                h1 { class: "text-3xl font-bold", "Dashboard" }
                p { class: "text-gray-400 mt-1", "Overview of your content management system" }
            }

            // Stats cards
            div { class: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8",
                match stats().as_ref() {
                    None => {
                        rsx! {
                            // Loading state
                            for _ in 0..4 {
                                div { class: "bg-gray-800 rounded-lg p-4 h-24 animate-pulse" }
                            }
                        }
                    }
                    Some(stats) => {
                        rsx! {
                            StatsCard {
                                title: "Total Posts".to_string(),
                                value: stats.as_ref().map_or("0".to_string(), |s| s.total_posts.to_string()),
                                icon: "📝".to_string(),
                                color: "blue".to_string(),
                                change: None,
                            }

                            StatsCard {
                                title: "Published Posts".to_string(),
                                value: stats.as_ref().map_or("0".to_string(), |s| s.published_posts.to_string()),
                                icon: "🌐".to_string(),
                                color: "green".to_string(),
                                change: None,
                            }

                            StatsCard {
                                title: "Draft Posts".to_string(),
                                value: stats.as_ref().map_or("0".to_string(), |s| s.draft_posts.to_string()),
                                icon: "📋".to_string(),
                                color: "yellow".to_string(),
                                change: None,
                            }

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

            // Quick actions
            div { class: "card p-6 mb-8",
                div { class: "card-header mb-4",
                    h2 { class: "text-xl font-bold", "Quick Actions" }
                }

                div { class: "card-body grid grid-cols-2 md:grid-cols-4 gap-4",
                    Link {
                        to: Route::NewPost {},
                        class: "bg-blue-600 hover:bg-blue-700 text-white rounded-lg p-4 text-center transition-all shadow-md hover:shadow-lg",
                        span { class: "block text-2xl mb-2", "📝" }
                        span { class: "text-sm font-medium", "Create Post" }
                    }

                    Link {
                        to: Route::Posts {},
                        class: "bg-gray-700 hover:bg-gray-600 text-white rounded-lg p-4 text-center transition-all shadow-md hover:shadow-lg",
                        span { class: "block text-2xl mb-2", "📋" }
                        span { class: "text-sm font-medium", "Manage Posts" }
                    }

                    Link {
                        to: Route::Users {},
                        class: "bg-gray-700 hover:bg-gray-600 text-white rounded-lg p-4 text-center transition-all shadow-md hover:shadow-lg",
                        span { class: "block text-2xl mb-2", "👥" }
                        span { class: "text-sm font-medium", "Manage Users" }
                    }

                    Link {
                        to: Route::Blog {},
                        class: "bg-gray-700 hover:bg-gray-600 text-white rounded-lg p-4 text-center transition-all shadow-md hover:shadow-lg",
                        span { class: "block text-2xl mb-2", "🌐" }
                        span { class: "text-sm font-medium", "View Blog" }
                    }
                }
            }

            // Recent posts
            div { class: "card p-6",
                div { class: "card-header flex justify-between items-center mb-4",
                    h2 { class: "text-xl font-bold", "Recent Posts" }

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
                                div { class: "animate-pulse space-y-3",
                                    for _ in 0..3 {
                                        div { class: "bg-gray-700 h-16 rounded-md" }
                                    }
                                }
                            }
                        }
                        Some(posts) if posts.is_empty() => {
                            rsx! {
                                div { class: "text-center py-8 text-gray-400 border border-dashed border-gray-700 rounded-md",
                                    "No posts yet. Create your first post!"
                                }
                            }
                        }
                        Some(posts) => {
                            rsx! {
                                div { class: "space-y-3",
                                    for post in posts.iter().take(5) {
                                        div {
                                            class: "bg-gray-700 p-3 rounded-md flex justify-between items-center shadow-md transition-all hover:shadow-lg",
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
