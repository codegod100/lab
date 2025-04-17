use dioxus::prelude::*;
use crate::models::UserRole;
use crate::utils::get_users_server;

#[component]
pub fn Users() -> Element {
    let users = use_resource(|| async move {
        get_users_server().await.unwrap_or_default()
    });
    
    // Helper function to get the appropriate CSS class for role badges
    fn get_role_badge_class(role: &UserRole) -> &'static str {
        match role {
            UserRole::Admin => "bg-red-900 text-red-200",
            UserRole::Editor => "bg-blue-900 text-blue-200",
            UserRole::Author => "bg-green-900 text-green-200",
            UserRole::Subscriber => "bg-gray-700 text-gray-300",
        }
    }
    
    rsx! {
        div { class: "container mx-auto px-4 py-8",
            h1 { class: "text-3xl font-bold mb-8", "User Management" }
            
            match users().as_ref() {
                None => {
                    rsx! {
                        // Loading state
                        div { class: "bg-gray-800 rounded-lg p-8 text-center",
                            if users.loading() {
                                div { class: "animate-pulse space-y-4",
                                    div { class: "h-8 bg-gray-700 rounded w-1/4 mx-auto" }
                                    div { class: "h-64 bg-gray-700 rounded mt-8" }
                                }
                            } else {
                                div {
                                    h2 { class: "text-2xl font-bold text-red-400", "Error Loading Users" }
                                    p { class: "text-gray-400 mt-2", "There was a problem loading the user data. Please try again later." }
                                }
                            }
                        }
                    }
                }
                Some(users) if users.is_empty() => {
                    rsx! {
                        div { class: "bg-gray-800 rounded-lg p-8 text-center",
                            h2 { class: "text-2xl font-bold", "No Users Found" }
                            p { class: "text-gray-400 mt-2", "There are no users in the system yet." }
                        }
                    }
                }
                Some(users) => {
                    rsx! {
                        // Users table
                        div { class: "bg-gray-800 rounded-lg shadow overflow-hidden",
                            div { class: "overflow-x-auto",
                                table { class: "min-w-full divide-y divide-gray-700",
                                    thead { class: "bg-gray-700",
                                        tr {
                                            th { class: "px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider", "ID" }
                                            th { class: "px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider", "Username" }
                                            th { class: "px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider", "Display Name" }
                                            th { class: "px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider", "Role" }
                                            th { class: "px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider", "Actions" }
                                        }
                                    }
                                    tbody { class: "bg-gray-800 divide-y divide-gray-700",
                                        {users.iter().map(|user| {
                                            let role_class = get_role_badge_class(&user.role);
                                            rsx! {
                                                tr { key: user.id,
                                                    td { class: "px-6 py-4 whitespace-nowrap text-sm text-gray-300", "{user.id}" }
                                                    td { class: "px-6 py-4 whitespace-nowrap text-sm text-white", "{user.username}" }
                                                    td { class: "px-6 py-4 whitespace-nowrap text-sm text-white", "{user.display_name}" }
                                                    td { class: "px-6 py-4 whitespace-nowrap",
                                                        span {
                                                            class: "px-2 py-1 text-xs rounded-full {role_class}",
                                                            "{format!(\"{:?}\", user.role)}"
                                                        }
                                                    }
                                                    td { class: "px-6 py-4 whitespace-nowrap text-right text-sm font-medium",
                                                        button {
                                                            class: "text-blue-400 hover:text-blue-300 mr-3",
                                                            disabled: true, // Not implemented in this demo
                                                            "Edit"
                                                        }
                                                    }
                                                }
                                            }
                                        })}
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
