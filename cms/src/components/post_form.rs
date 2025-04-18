use crate::models::Post;
use dioxus::prelude::*;

mod wasm;
#[cfg(target_arch = "wasm32")]
use wasm::*;

#[component]
pub fn PostForm(post: Post, on_submit: EventHandler<Post>, is_submitting: bool) -> Element {
    let is_edit_mode = post.id > 0;

    let mut title = use_signal(|| post.title.clone());
    let post_body = post.body.clone();
    let mut published = use_signal(|| post.published);
    let mut category = use_signal(|| post.category.clone());
    let mut tags_input = use_signal(|| post.tags.join(", "));
    #[cfg(target_arch = "wasm32")]
    let mut quill_editor = use_signal(|| None::<Quill>);
    #[cfg(not(target_arch = "wasm32"))]
    let mut quill_editor = use_signal(|| None::<()>);

    let editor_id = format!("quill-editor-{}", post.id);
    let editor_id_for_effect = editor_id.clone();

    #[cfg(target_arch = "wasm32")]
    let mut init_editor = {
        let post_body = post_body.clone();
        let quill_editor = quill_editor.clone();
        move |editor_id_str: &str| {
            let editor_id_selector = format!("#{}", editor_id_str);
            let body_content = post_body.clone();
            let editor_id_selector_clone = editor_id_selector.clone();
            let body_content_clone = body_content.clone();
            let mut quill_editor_clone = quill_editor.clone();
            let closure = wasm_bindgen::closure::Closure::once_into_js(move || {
                match init_quill(&editor_id_selector_clone) {
                    Ok(quill) => {
                        console::log_1(&wasm_bindgen::JsValue::from_str(&format!("[Init] Setting Quill HTML: {}", body_content_clone)));
                        set_quill_html(&quill, &body_content_clone);
                        quill_editor_clone.set(Some(quill));
                        web_sys::console::log_1(&wasm_bindgen::JsValue::from_str("Quill editor initialized successfully"));
                    }
                    Err(e) => {
                        web_sys::console::error_1(&e);
                        web_sys::console::log_1(&wasm_bindgen::JsValue::from_str("Will retry editor initialization in 200ms"));
                        let editor_id_selector_retry = editor_id_selector_clone.clone();
                        let body_content_retry = body_content_clone.clone();
                        let mut quill_editor_retry = quill_editor_clone.clone();
                        let retry_closure = wasm_bindgen::closure::Closure::once_into_js(move || {
                            match init_quill(&editor_id_selector_retry) {
                                Ok(quill) => {
                                    set_quill_html(&quill, &body_content_retry);
                                    quill_editor_retry.set(Some(quill));
                                    web_sys::console::log_1(&wasm_bindgen::JsValue::from_str("Quill editor initialized successfully on retry"));
                                }
                                Err(e) => {
                                    web_sys::console::error_1(&e);
                                    web_sys::console::log_1(&wasm_bindgen::JsValue::from_str("Will retry editor initialization in 500ms"));
                                    let editor_id_selector_final = editor_id_selector_retry.clone();
                                    let body_content_final = body_content_retry.clone();
                                    let mut quill_editor_final = quill_editor_retry.clone();
                                    let final_closure = wasm_bindgen::closure::Closure::once_into_js(move || {
                                        match init_quill(&editor_id_selector_final) {
                                            Ok(quill) => {
                                                set_quill_html(&quill, &body_content_final);
                                                quill_editor_final.set(Some(quill));
                                                web_sys::console::log_1(&wasm_bindgen::JsValue::from_str("Quill editor initialized successfully on final retry"));
                                            }
                                            Err(e) => {
                                                web_sys::console::error_1(&e);
                                                web_sys::console::error_1(&wasm_bindgen::JsValue::from_str("Failed to initialize Quill editor after multiple attempts"));
                                            }
                                        }
                                    });
                                    web_sys::window().unwrap().set_timeout_with_callback_and_timeout_and_arguments_0(final_closure.as_ref().unchecked_ref(), 500).unwrap();
                                }
                            }
                        });
                        web_sys::window().unwrap().set_timeout_with_callback_and_timeout_and_arguments_0(retry_closure.as_ref().unchecked_ref(), 200).unwrap();
                    }
                }
            });
            web_sys::window().unwrap().set_timeout_with_callback_and_timeout_and_arguments_0(closure.as_ref().unchecked_ref(), 100).unwrap();
        }
    };

    #[cfg(target_arch = "wasm32")]
    let handle_submit = {
        let post_body = post_body.clone();
        let quill_editor = quill_editor.clone();
        let title = title.clone();
        let published = published.clone();
        let category = category.clone();
        let tags_input = tags_input.clone();
        move |evt: FormEvent| {
            evt.prevent_default();

            web_sys::console::log_1(&wasm_bindgen::JsValue::from_str("Form submit event triggered"));

            web_sys::console::log_1(&wasm_bindgen::JsValue::from_str(&format!("Submission state: {}", is_submitting)));

            let tags = tags_input()
                .split(',')
                .map(|s| s.trim().to_string())
                .filter(|s| !s.is_empty())
                .collect();

            web_sys::console::log_1(&wasm_bindgen::JsValue::from_str(&format!("Form data: title={}, published={}", title(), published())));

            let content = {
                let has_quill = quill_editor.read().is_some();
                console::log_1(&wasm_bindgen::JsValue::from_str(&format!("Quill editor initialized: {}", has_quill)));
                if let Some(ref quill) = *quill_editor.read() {
                    let html = get_quill_html(quill);
                    console::log_1(&wasm_bindgen::JsValue::from_str(&format!("Quill HTML content length: {}", html.len())));
                    if html.is_empty() {
                        console::log_1(&wasm_bindgen::JsValue::from_str("Quill content empty, using body signal"));
                        post_body.clone()
                    } else {
                        html
                    }
                } else {
                    console::log_1(&wasm_bindgen::JsValue::from_str("No Quill editor, using body signal"));
                    post_body.clone()
                }
            };

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

            if new_post.title.trim().is_empty() {
                console::log_1(&wasm_bindgen::JsValue::from_str("Please enter a title for your post"));
                web_sys::window().unwrap().alert_with_message("Please enter a title for your post");
                return;
            }

            console::log_1(&wasm_bindgen::JsValue::from_str("Calling on_submit handler"));

            on_submit.call(new_post);
        }
    };

    #[cfg(target_arch = "wasm32")]
    let onsubmit_handler = handle_submit;
    #[cfg(not(target_arch = "wasm32"))]
    let onsubmit_handler = |_| {};

    #[cfg(target_arch = "wasm32")]
    use_effect(move || {
        let body_val = post_body.clone();
        if let Some(quill) = quill_editor.read().as_ref() {
            console::log_1(&wasm_bindgen::JsValue::from_str(&format!("[Effect] Setting Quill HTML: {}", body_val)));
            set_quill_html(quill, &body_val);
        } else {
            console::log_1(&wasm_bindgen::JsValue::from_str("[Effect] Quill editor not initialized yet"));
        }
        ()
    });

    #[cfg(target_arch = "wasm32")]
    init_editor(&editor_id);

    rsx! {
        form {
            class: "bg-gray-800 p-6 shadow-lg border border-gray-700 rounded-lg",
            onsubmit: onsubmit_handler,

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

                    div {
                        class: "bg-white rounded-lg border border-gray-600 min-h-[300px] text-black",
                        id: "{editor_id}",
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
