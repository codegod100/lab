use dioxus::prelude::*;
use crate::models::Post;

#[cfg(target_arch = "wasm32")]
use crate::utils::{init_quill, get_quill_html, set_quill_html};
#[cfg(target_arch = "wasm32")]
use wasm_bindgen::JsValue;

#[component]
pub fn PostForm(
    post: Post,
    on_submit: EventHandler<Post>,
    is_submitting: bool
) -> Element {
    let is_edit_mode = post.id > 0;

    let mut title = use_signal(|| post.title.clone());
    let mut body = use_signal(|| post.body.clone());
    let mut published = use_signal(|| post.published);
    let mut category = use_signal(|| post.category.clone());
    let mut tags_input = use_signal(|| post.tags.join(", "));

    #[cfg(target_arch = "wasm32")]
    let mut quill_editor = use_signal(|| None);

    let editor_id = format!("quill-editor-{}", post.id);

    #[cfg(target_arch = "wasm32")]
    {
        // Create a clone for use in the effect
        let editor_id_for_effect = editor_id.clone();

        let mut init_editor = move |editor_id_str: &str| {
            let editor_id_selector = format!("#{}", editor_id_str);
            match init_quill(&editor_id_selector) {
                Ok(quill) => {
                    set_quill_html(&quill, &body());
                    quill_editor.set(Some(quill));
                }
                Err(e) => {
                    web_sys::console::error_1(&e);
                }
            }
        };

        use_effect(move || {
            init_editor(&editor_id_for_effect);
            (|| {})()
        });
    }

    let handle_submit = move |evt: FormEvent| {
        evt.prevent_default();

        let tags = tags_input()
            .split(',')
            .map(|s| s.trim().to_string())
            .filter(|s| !s.is_empty())
            .collect();

        #[cfg(target_arch = "wasm32")]
        let content = if let Some(ref quill) = *quill_editor.read() {
            get_quill_html(quill)
        } else {
            body()
        };

        #[cfg(not(target_arch = "wasm32"))]
        let content = body();

        let new_post = Post {
            id: post.id,
            title: title(),
            body: content,
            published: published(),
            category: if category().is_some() && category().as_ref().unwrap().is_empty() {
                None
            } else {
                category()
            },
            tags,
            created_at: post.created_at,
            updated_at: post.updated_at,
        };

        on_submit.call(new_post);
    };

    rsx! {
        form {
            class: "bg-gray-800 p-6 shadow-lg border border-gray-700 rounded-lg",
            onsubmit: handle_submit,

            div { class: "pb-2 mb-6 border-b border-gray-700",
                h2 {
                    class: "text-2xl font-bold",
                    if is_edit_mode { "Edit Post" } else { "Create New Post" }
                }
            }

            div { class: "space-y-6",
                // Title field
                div { class: "mb-4",
                    label {
                        class: "block text-sm font-medium text-gray-300 mb-1",
                        "Title"
                    }
                    input {
                        class: "w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                        r#type: "text",
                        value: "{title}",
                        placeholder: "Enter post title",
                        required: true,
                        oninput: move |e| title.set(e.value())
                    }
                }

                // Content field
                div { class: "mb-4",
                    label {
                        class: "block text-sm font-medium text-gray-300 mb-1",
                        "Content"
                    }

                    // Editor container - different implementation for WASM vs native
                    if cfg!(target_arch = "wasm32") {
                        div {
                            class: "bg-white rounded-lg border border-gray-600 min-h-[300px] text-black",
                            id: "{editor_id}",
                        }
                    } else {
                        textarea {
                            class: "w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[300px]",
                            value: "{body}",
                            placeholder: "Enter post content",
                            required: true,
                            oninput: move |e| body.set(e.value())
                        }
                    }
                }

                // Category field
                div { class: "mb-4",
                    label {
                        class: "block text-sm font-medium text-gray-300 mb-1",
                        "Category (optional)"
                    }
                    input {
                        class: "w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                        r#type: "text",
                        value: "{category().unwrap_or_default()}",
                        placeholder: "E.g., News, Tutorial, Announcement",
                        oninput: move |e| category.set(Some(e.value()))
                    }
                }

                // Tags field
                div { class: "mb-4",
                    label {
                        class: "block text-sm font-medium text-gray-300 mb-1",
                        "Tags (comma separated)"
                    }
                    input {
                        class: "w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                        r#type: "text",
                        value: "{tags_input}",
                        placeholder: "E.g., news, important, featured",
                        oninput: move |e| tags_input.set(e.value())
                    }
                }

                // Published checkbox
                div { class: "mb-6 flex items-center",
                    label { class: "flex items-center cursor-pointer",
                        input {
                            class: "mr-2 h-4 w-4 accent-blue-500",
                            r#type: "checkbox",
                            checked: "{published}",
                            onchange: move |e| published.set(e.value() == "on")
                        }
                        span { class: "text-sm text-gray-300", "Publish this post" }
                    }
                }

                // Submit button
                div { class: "flex justify-end",
                    button {
                        class: "px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
                        r#type: "submit",
                        disabled: is_submitting,
                        if is_submitting {
                            "Saving..."
                        } else if is_edit_mode {
                            "Update Post"
                        } else {
                            "Create Post"
                        }
                    }
                }
            }
        }
    }
}
