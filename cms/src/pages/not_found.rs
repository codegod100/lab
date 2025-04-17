use dioxus::prelude::*;
use crate::routes::Route;

#[component]
pub fn NotFound() -> Element {
    rsx! {
        div { class: "min-h-[70vh] flex items-center justify-center",
            div { class: "text-center",
                h1 { class: "text-6xl font-bold text-gray-700", "404" }
                h2 { class: "text-3xl font-bold mt-4 mb-2", "Page Not Found" }
                p { class: "text-gray-400 mb-8", "The page you are looking for doesn't exist or has been moved." }
                
                Link {
                    to: Route::Dashboard {},
                    class: "px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors",
                    "Go to Dashboard"
                }
            }
        }
    }
}
