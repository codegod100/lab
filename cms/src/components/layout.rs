use dioxus::prelude::*;
use crate::routes::Route;

#[component]
pub fn Layout() -> Element {
    rsx! {
        div { class: "min-h-screen bg-gray-900 text-white",
            // Header/Navbar
            header { class: "bg-gray-800 shadow-md",
                div { class: "container mx-auto px-4 py-3",
                    div { class: "flex items-center justify-between",
                        // Logo/Brand
                        Link { 
                            to: Route::Dashboard {}, 
                            class: "text-xl font-bold text-white flex items-center",
                            span { class: "text-blue-400 mr-1", "✦" }
                            "CMS"
                        }
                        
                        // Main Navigation
                        nav { class: "hidden md:flex space-x-1",
                            Link {
                                class: "px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition-colors",
                                to: Route::Dashboard {},
                                "Dashboard"
                            }
                            Link {
                                class: "px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition-colors",
                                to: Route::Posts {},
                                "Posts"
                            }
                            Link {
                                class: "px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition-colors",
                                to: Route::Users {},
                                "Users"
                            }
                            Link {
                                class: "px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition-colors",
                                to: Route::Blog {},
                                "View Blog"
                            }
                        }
                        
                        // User menu (simplified)
                        div { class: "flex items-center",
                            div { class: "ml-3 relative",
                                div { class: "flex items-center",
                                    span { class: "bg-gray-700 rounded-full p-1 flex items-center justify-center h-8 w-8",
                                        "A" // Avatar placeholder
                                    }
                                    span { class: "ml-2 hidden md:inline", "Admin" }
                                }
                            }
                        }
                    }
                }
            }
            
            // Mobile Navigation (shown on small screens)
            div { class: "md:hidden bg-gray-800 border-t border-gray-700 fixed bottom-0 w-full",
                div { class: "grid grid-cols-4 text-center",
                    Link {
                        class: "flex flex-col items-center py-2 text-gray-300 hover:text-white",
                        to: Route::Dashboard {},
                        span { class: "text-xl", "📊" }
                        span { class: "text-xs", "Dashboard" }
                    }
                    Link {
                        class: "flex flex-col items-center py-2 text-gray-300 hover:text-white",
                        to: Route::Posts {},
                        span { class: "text-xl", "📝" }
                        span { class: "text-xs", "Posts" }
                    }
                    Link {
                        class: "flex flex-col items-center py-2 text-gray-300 hover:text-white",
                        to: Route::Users {},
                        span { class: "text-xl", "👥" }
                        span { class: "text-xs", "Users" }
                    }
                    Link {
                        class: "flex flex-col items-center py-2 text-gray-300 hover:text-white",
                        to: Route::Blog {},
                        span { class: "text-xl", "🌐" }
                        span { class: "text-xs", "Blog" }
                    }
                }
            }
            
            // Main Content
            main { class: "container mx-auto px-4 py-6 pb-20 md:pb-6",
                Outlet::<Route> {}
            }
            
            // Footer
            footer { class: "bg-gray-800 mt-auto hidden md:block",
                div { class: "container mx-auto px-4 py-4",
                    div { class: "flex justify-between items-center",
                        div { class: "text-sm text-gray-400",
                            "© 2023 CMS - Built with Dioxus"
                        }
                        div { class: "text-sm text-gray-400",
                            "Version 1.0"
                        }
                    }
                }
            }
        }
    }
}
