use dioxus::prelude::*;
use crate::components::PostForm;
use crate::models::Post;
use crate::routes::Route;
use crate::utils::{get_post_by_id_server, update_post_server};

#[derive(Props, PartialEq, Clone)]
pub struct EditPostProps {
    pub id: usize,
}

#[component]
pub fn EditPost(EditPostProps { id }: EditPostProps) -> Element {
    // Use use_server_future for consistency with posts.rs
    let post = use_server_future(move || get_post_by_id_server(id))?.value();

    // Signal to trigger update
    let mut update_params = use_signal(|| None::<Post>);
    // use_server_future for updating post
    let update_result = use_server_future(move || {
        let params = update_params();
        async move {
            if let Some(updated_post) = params {
                update_post_server(
                    id,
                    Some(updated_post.title.clone()),
                    Some(updated_post.body.clone()),
                    Some(updated_post.published),
                    Some(updated_post.category.clone()),
                    Some(updated_post.tags.clone()),
                ).await
            } else {
                // No update triggered
                Ok(None)
            }
        }
    })?.value();

    let mut is_submitting = use_signal(|| false);
    let mut error = use_signal(|| None::<String>);
    let mut success = use_signal(|| false);

    let navigator = use_navigator();

    let mut handle_submit = move |updated_post: Post| {
        is_submitting.set(true);
        error.set(None);
        success.set(false);
        update_params.set(Some(updated_post));
    };

    // React to update_result
    use_effect(move || {
        match update_result() {
            Some(Ok(Some(_))) => {
                success.set(true);
                is_submitting.set(false);
                // Navigate after delay
                let nav = navigator.clone();
                spawn(async move {
                    tokio::time::sleep(std::time::Duration::from_millis(1000)).await;
                    nav.push(Route::PostDetail { id });
                });
            }
            Some(Ok(None)) => {
                error.set(Some("Post not found".to_string()));
                is_submitting.set(false);
            }
            Some(Err(e)) => {
                error.set(Some(format!("Error updating post: {}", e)));
                is_submitting.set(false);
            }
            _ => {}
        }
        // Return () for use_effect cleanup
        ()
    });

    rsx! {
        div { class: "container mx-auto px-4 py-8",
            // Page header
            div { class: "mb-6",
                div { class: "flex items-center justify-between",
                    div {
                        h1 { class: "text-3xl font-bold", "Edit Post" }
                        p { class: "text-gray-400 mt-1", "Update your blog post" }
                    }

                    Link {
                        to: Route::PostDetail { id },
                        class: "text-blue-400 hover:text-blue-300",
                        "Cancel"
                    }
                }
            }

            // Status messages
            if success() {
                div { class: "bg-green-900/30 border border-green-500/50 text-green-200 px-4 py-3 rounded-md mb-4",
                    "Post updated successfully! Redirecting..."
                }
            }

            if let Some(err) = error() {
                div { class: "bg-red-900/30 border border-red-500/50 text-red-200 px-4 py-3 rounded-md mb-4",
                    "{err}"
                }
            }

            match post() {
                Some(Ok(Some(post))) => {
                    rsx! {
                        // Post form
                        PostForm {
                            post: post.clone(),
                            on_submit: EventHandler::new(move |post| handle_submit(post)),
                            is_submitting: is_submitting()
                        }
                    }
                }
                Some(Ok(None)) => {
                    rsx! {
                        div { class: "bg-gray-800 rounded-lg p-8 text-center",
                            h1 { class: "text-2xl font-bold text-red-400", "Post Not Found" }
                            p { class: "text-gray-400 mt-2", "The post you're trying to edit doesn't exist or has been deleted." }
                            div { class: "mt-6",
                                Link {
                                    to: Route::Posts {},
                                    class: "px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700",
                                    "View All Posts"
                                }
                            }
                        }
                    }
                }
                Some(Err(_)) => {
                    rsx! {
                        div { class: "bg-gray-800 rounded-lg p-8 text-center",
                            h2 { class: "text-2xl font-bold text-red-400", "Error Loading Post" },
                            p { class: "text-gray-400 mt-2", "There was a problem loading the post. Please try again later." },
                        }
                    }
                }
                None => {
                    rsx! {
                        // Loading state
                        div { class: "bg-gray-800 rounded-lg p-8 text-center",
                            div { class: "animate-pulse space-y-4",
                                div { class: "h-8 bg-gray-700 rounded w-3/4 mx-auto" }
                                div { class: "h-4 bg-gray-700 rounded w-1/4 mx-auto" }
                                div { class: "h-32 bg-gray-700 rounded mt-8" }
                            }
                        }
                    }
                }
            }
        }
    }
}
