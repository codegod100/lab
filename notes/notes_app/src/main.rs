use dioxus::prelude::*;
use gloo_storage::{LocalStorage, Storage};

#[derive(Debug, Clone, PartialEq, serde::Serialize, serde::Deserialize)]
struct Note {
    id: usize,
    title: String,
    content: String,
    created_at: String,
}

const STORAGE_KEY: &str = "dioxus_notes_app";

fn main() {
    // Launch the web app
    dioxus_web::launch::launch(App, vec![], vec![]);
}

fn App() -> Element {
    // Load notes from storage or use default
    let mut notes = use_signal(|| {
        LocalStorage::get(STORAGE_KEY).unwrap_or_else(|_| {
            vec![
                Note {
                    id: 1,
                    title: "Welcome".to_string(),
                    content: "Welcome to your new note-taking app!".to_string(),
                    created_at: current_date_time(),
                },
            ]
        })
    });
    
    let mut title = use_signal(|| String::new());
    let mut content = use_signal(|| String::new());
    let mut search = use_signal(|| String::new());
    
    // Save notes whenever they change
    use_effect(move || {
        let _ = LocalStorage::set(STORAGE_KEY, notes.read().as_slice());
    });
    
    let add_note = move |_| {
        if title.read().trim().is_empty() || content.read().trim().is_empty() {
            return;
        }
        
        let new_id = if let Some(max_id) = notes.read().iter().map(|note| note.id).max() {
            max_id + 1
        } else {
            1
        };
        
        notes.write().push(Note {
            id: new_id,
            title: title.read().clone(),
            content: content.read().clone(),
            created_at: current_date_time(),
        });
        
        title.set(String::new());
        content.set(String::new());
    };
    
    let mut delete_note = move |id: usize| {
        notes.write().retain(|note| note.id != id);
    };
    
    // Filter notes based on search
    let filtered_notes = move || {
        if search.read().is_empty() {
            return notes.read().clone();
        }
        
        let search_term = search.read().to_lowercase();
        notes.read()
            .iter()
            .filter(|note| {
                note.title.to_lowercase().contains(&search_term) || 
                note.content.to_lowercase().contains(&search_term)
            })
            .cloned()
            .collect::<Vec<Note>>()
    };
    
    rsx! {
        div { class: "container mx-auto p-4 max-w-4xl",
            h1 { class: "text-3xl font-bold mb-4 text-center text-blue-600", "Notes App" }
            
            // Form to add new notes
            div { class: "mb-6 p-4 bg-gray-50 rounded-lg shadow",
                h2 { class: "text-xl mb-3 font-semibold", "Add New Note" }
                div { class: "mb-3",
                    label { class: "block mb-1 font-medium", "Title:" }
                    input {
                        class: "w-full p-2 border rounded focus:ring focus:ring-blue-300 focus:outline-none",
                        value: title.read().clone(),
                        oninput: move |evt| title.set(evt.value().clone()),
                        placeholder: "Note title"
                    }
                }
                div { class: "mb-3",
                    label { class: "block mb-1 font-medium", "Content:" }
                    textarea {
                        class: "w-full p-2 border rounded focus:ring focus:ring-blue-300 focus:outline-none",
                        value: content.read().clone(),
                        oninput: move |evt| content.set(evt.value().clone()),
                        placeholder: "Note content",
                        rows: "4"
                    }
                }
                button {
                    class: "bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition",
                    onclick: add_note,
                    "Add Note"
                }
            }
            
            // Search bar
            div { class: "mb-4",
                input {
                    class: "w-full p-2 border rounded focus:ring focus:ring-blue-300 focus:outline-none",
                    placeholder: "Search notes...",
                    value: search.read().clone(),
                    oninput: move |evt| search.set(evt.value().clone())
                }
            }
            
            // Notes display
            div {
                h2 { class: "text-xl mb-2 font-semibold", 
                    "Your Notes ",
                    span { class: "text-gray-500 text-sm", 
                        "({filtered_notes().len()})" 
                    }
                }
                
                {if filtered_notes().is_empty() {
                    rsx! {
                        div { class: "text-center p-8 text-gray-500 italic", 
                            "No notes found. Add a new note or try a different search term." 
                        }
                    }
                } else {
                    rsx! {}
                }}
                
                div { class: "grid grid-cols-1 md:grid-cols-2 gap-4",
                    {filtered_notes().into_iter().map(|note| {
                        let note_id = note.id;
                        rsx! {
                            div {
                                key: "{note.id}",
                                class: "p-4 border rounded-lg shadow hover:shadow-md transition",
                                div { class: "flex justify-between items-start mb-2",
                                    h3 { class: "font-bold text-lg text-blue-700", "{note.title}" }
                                    span { class: "text-xs text-gray-500", "{note.created_at}" }
                                }
                                p { class: "mb-4 whitespace-pre-wrap", "{note.content}" }
                                button {
                                    class: "bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition",
                                    onclick: move |_| delete_note(note_id),
                                    "Delete"
                                }
                            }
                        }
                    })}
                }
            }
            
            footer { class: "mt-8 text-center text-sm text-gray-500",
                "Dioxus Notes App © 2025"
            }
        }
    }
}

fn current_date_time() -> String {
    let now = js_sys::Date::new_0();
    format!(
        "{:04}-{:02}-{:02} {:02}:{:02}",
        now.get_full_year(),
        now.get_month() + 1,
        now.get_date(),
        now.get_hours(),
        now.get_minutes()
    )
}