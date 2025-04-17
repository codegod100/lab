use dioxus::prelude::*;
use crate::models::Post;

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

    let handle_submit = move |evt: FormEvent| {
        evt.prevent_default();

        let tags = tags_input()
            .split(',')
            .map(|s| s.trim().to_string())
            .filter(|s| !s.is_empty())
            .collect();

        let new_post = Post {
            id: post.id,
            title: title(),
            body: body(),
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
            class: "card p-6 shadow-lg",
            onsubmit: handle_submit,

            div { class: "card-header pb-2 mb-6",
                h2 {
                    class: "text-2xl font-bold",
                    if is_edit_mode { "Edit Post" } else { "Create New Post" }
                }
            }

            div { class: "card-body space-y-4",
                // Title field
                div { class: "mb-4",
                    label {
                        class: "form-label",
                        "Title"
                    }
                    input {
                        class: "form-input",
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
                        class: "form-label",
                        "Content"
                    }
                    textarea {
                        class: "form-input min-h-[200px]",
                        value: "{body}",
                        placeholder: "Enter post content",
                        required: true,
                        oninput: move |e| body.set(e.value())
                    }
                }

                // Category field
                div { class: "mb-4",
                    label {
                        class: "form-label",
                        "Category (optional)"
                    }
                    input {
                        class: "form-input",
                        r#type: "text",
                        value: "{category().unwrap_or_default()}",
                        placeholder: "E.g., News, Tutorial, Announcement",
                        oninput: move |e| category.set(Some(e.value()))
                    }
                }

                // Tags field
                div { class: "mb-4",
                    label {
                        class: "form-label",
                        "Tags (comma separated)"
                    }
                    input {
                        class: "form-input",
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
                        class: "btn btn-lg btn-primary disabled:opacity-50 disabled:cursor-not-allowed",
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
