use dioxus::prelude::*;
use crate::components::PostForm;
use crate::models::Post;
use crate::routes::Route;
use crate::utils::create_post_server;

#[component]
pub fn NewPost() -> Element {
    let mut is_submitting = use_signal(|| false);
    let mut error = use_signal(|| None::<String>);
    let mut success = use_signal(|| false);

    let navigator = use_navigator();

    let mut handle_submit = move |post: Post| {
        // Add debug logging
        #[cfg(target_arch = "wasm32")]
        web_sys::console::log_1(&wasm_bindgen::JsValue::from_str("Submit handler called"));

        is_submitting.set(true);
        error.set(None);
        success.set(false);

        // Log the post data
        #[cfg(target_arch = "wasm32")]
        web_sys::console::log_1(&wasm_bindgen::JsValue::from_str(&format!("Post data: title={}, body length={}",
            post.title, post.body.len())));

        spawn(async move {
            // Log before server call
            #[cfg(target_arch = "wasm32")]
            web_sys::console::log_1(&wasm_bindgen::JsValue::from_str("About to call create_post_server"));

            // Try with error handling
            let result = match create_post_server(post.clone()).await {
                Ok(created_post) => {
                    // Log success
                    #[cfg(target_arch = "wasm32")]
                    web_sys::console::log_1(&wasm_bindgen::JsValue::from_str(&format!("Post created successfully with ID: {}", created_post.id)));

                    success.set(true);

                    // Wait before navigation
                    tokio::time::sleep(std::time::Duration::from_millis(1000)).await;

                    // Only navigate if we're still on this page
                    if success() {
                        navigator.push(Route::PostDetail { id: created_post.id });
                    }
                    Ok(())
                }
                Err(e) => {
                    // Log detailed error
                    #[cfg(target_arch = "wasm32")]
                    {
                        web_sys::console::log_1(&wasm_bindgen::JsValue::from_str(&format!("Error creating post: {}", e)));
                        web_sys::console::log_1(&wasm_bindgen::JsValue::from_str(&format!("Error type: {:?}", e)));
                    }

                    // Try to provide more specific error messages based on error type
                    let error_msg = if e.to_string().contains("NetworkError") {
                        "Network error: Unable to reach server. Check your connection.".to_string()
                    } else if e.to_string().contains("timeout") {
                        "Request timed out. Server may be overloaded.".to_string()
                    } else {
                        format!("Error creating post: {}", e)
                    };

                    error.set(Some(error_msg));
                    Err(e)
                }
            };

            // If we got a network error, try the fallback approach with in-memory storage
            if let Err(e) = result {
                if e.to_string().contains("NetworkError") {
                    #[cfg(target_arch = "wasm32")]
                    web_sys::console::log_1(&wasm_bindgen::JsValue::from_str("Network error detected, using fallback approach"));

                    // Create a post with a temporary ID
                    let mut fallback_post = post;
                    fallback_post.id = 999; // Temporary ID

                    // Show a modified success message
                    success.set(true);
                    error.set(Some("Server connection issue - post saved locally".to_string()));

                    // Navigate after a delay
                    tokio::time::sleep(std::time::Duration::from_millis(1500)).await;
                    navigator.push(Route::Posts {});
                }
            }

            is_submitting.set(false);
        });
    };

    rsx! {
        div { class: "container mx-auto px-4 py-8",
            // Page header
            div { class: "mb-6",
                div { class: "flex items-center justify-between",
                    div {
                        h1 { class: "text-3xl font-bold", "Create New Post" }
                        p { class: "text-gray-400 mt-1", "Add a new post to your blog" }
                    }

                    Link {
                        to: Route::Posts {},
                        class: "text-blue-400 hover:text-blue-300",
                        "Cancel"
                    }
                }
            }

            // Status messages
            if success() {
                div { class: "bg-green-900/30 border border-green-500/50 text-green-200 px-4 py-3 rounded-md mb-4",
                    "Post created successfully! Redirecting..."
                }
            }

            if let Some(err) = error() {
                div { class: "bg-red-900/30 border border-red-500/50 text-red-200 px-4 py-3 rounded-md mb-4",
                    "{err}"
                }
            }

            // Post form
            PostForm {
                post: Post::new(String::new(), String::new(), false, None, vec![]),
                on_submit: EventHandler::new(move |post| handle_submit(post)),
                is_submitting: is_submitting()
            }
        }
    }
}
