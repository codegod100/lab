use crate::routes::Route;
use dioxus::prelude::*;

#[component]
pub fn Layout() -> Element {
    rsx! {
        div { class: "min-h-screen bg-gray-900 text-white",
            // Header/Navbar
            header { class: "bg-gray-800 shadow-lg sticky top-0 z-10 border-b border-gray-700",
                div { class: "container mx-auto px-4 py-3",
                    div { class: "flex items-center justify-between",
                        // Logo/Brand
                        Link {
                            to: Route::Dashboard {},
                            class: "text-xl font-bold text-white flex items-center transition-all hover:text-indigo-400",
                            span { class: "text-indigo-400 mr-1", "✦" }
                            "CMS"
                        }

                        // Main Navigation
                        nav { class: "hidden md:flex space-x-3 p-2",
                            Link {
                                class: "px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-all flex items-center",
                                to: Route::Dashboard {},
                                span { class: "", "📊" }
                                "Dashboard"
                            }
                            Link {
                                class: "px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-all flex items-center",
                                to: Route::Posts {},
                                span { class: "mr-1.5 text-indigo-400 text-sm", "📝" }
                                "Posts"
                            }
                            Link {
                                class: "px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-all flex items-center",
                                to: Route::Users {},
                                span { class: "mr-1.5 text-indigo-400 text-sm", "👥" }
                                "Users"
                            }
                            Link {
                                class: "px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-all flex items-center",
                                to: Route::Blog {},
                                span { class: "mr-1.5 text-indigo-400 text-sm", "🌐" }
                                "Blog"
                            }
                        }




                    }
                }
            }

            // Main Content
            div { class: "container mx-auto px-4 py-8 pb-24 md:pb-8",
                // Main outlet
                main { class: "space-y-6",
                    Outlet::<Route> {}
                }
            }


        }
    }
}
