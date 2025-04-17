use dioxus::prelude::*;
use crate::routes::Route;

#[component]
pub fn Layout() -> Element {
    rsx! {
        div { class: "min-h-screen bg-gray-900 text-white",
            // Header/Navbar
            header { class: "bg-gray-800 shadow-md sticky top-0 z-10",
                div { class: "container mx-auto px-4 py-3",
                    div { class: "flex items-center justify-between",
                        // Logo/Brand
                        Link {
                            to: Route::Dashboard {},
                            class: "text-xl font-bold text-white flex items-center transition-all hover:text-blue-400",
                            span { class: "text-blue-400 mr-1", "✦" }
                            "CMS"
                        }

                        // Main Navigation
                        nav { class: "hidden md:flex space-x-2",
                            Link {
                                class: "px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition-all",
                                to: Route::Dashboard {},
                                "Dashboard"
                            }
                            Link {
                                class: "px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition-all",
                                to: Route::Posts {},
                                "Posts"
                            }
                            Link {
                                class: "px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition-all",
                                to: Route::Users {},
                                "Users"
                            }
                            Link {
                                class: "px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition-all",
                                to: Route::Blog {},
                                "View Blog"
                            }
                        }

                        // User menu (simplified)
                        div { class: "flex items-center",
                            div { class: "ml-3 relative",
                                div { class: "flex items-center",
                                    span { class: "bg-blue-600 rounded-full p-1 flex items-center justify-center h-8 w-8 shadow-md",
                                        "A" // Avatar placeholder
                                    }
                                    span { class: "ml-2 hidden md:inline font-medium", "Admin" }
                                }
                            }
                        }
                    }
                }
            }

            // Mobile Navigation (shown on small screens)
            div { class: "md:hidden bg-gray-800 border-t border-gray-700 fixed bottom-0 w-full shadow-lg z-10",
                div { class: "grid grid-cols-4 text-center",
                    Link {
                        class: "flex flex-col items-center py-3 text-gray-300 hover:text-white transition-all",
                        to: Route::Dashboard {},
                        span { class: "text-xl mb-1", "📊" }
                        span { class: "text-xs font-medium", "Dashboard" }
                    }
                    Link {
                        class: "flex flex-col items-center py-3 text-gray-300 hover:text-white transition-all",
                        to: Route::Posts {},
                        span { class: "text-xl mb-1", "📝" }
                        span { class: "text-xs font-medium", "Posts" }
                    }
                    Link {
                        class: "flex flex-col items-center py-3 text-gray-300 hover:text-white transition-all",
                        to: Route::Users {},
                        span { class: "text-xl mb-1", "👥" }
                        span { class: "text-xs font-medium", "Users" }
                    }
                    Link {
                        class: "flex flex-col items-center py-3 text-gray-300 hover:text-white transition-all",
                        to: Route::Blog {},
                        span { class: "text-xl mb-1", "🌐" }
                        span { class: "text-xs font-medium", "Blog" }
                    }
                }
            }

            // Main Content
            main { class: "container mx-auto px-4 py-6 pb-24 md:pb-6",
                Outlet::<Route> {}
            }

            // Footer
            footer { class: "bg-gray-800 mt-auto hidden md:block border-t border-gray-700",
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
