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
    
    let handle_submit = move |post: Post| {
        is_submitting.set(true);
        error.set(None);
        success.set(false);
        
        spawn(async move {
            match create_post_server(post).await {
                Ok(created_post) => {
                    success.set(true);
                    
                    // Navigate to the post detail page after a short delay
                    tokio::time::sleep(std::time::Duration::from_millis(1000)).await;
                    navigator.push(Route::PostDetail { id: created_post.id });
                }
                Err(e) => {
                    error.set(Some(format!("Error creating post: {}", e)));
                }
            }
            is_submitting.set(false);
        });
    };
    
    rsx! {
        div {
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
                post: None,
                on_submit: EventHandler::new(move |post| handle_submit(post)),
                is_submitting: is_submitting()
            }
        }
    }
}
