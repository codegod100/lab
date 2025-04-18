use dioxus::prelude::*;
use crate::models::UserRole;
use crate::utils::get_users_server;

// async fn test_users() -> Vec<User> {
//     let users = vec![
//         User {
//             id: 1,
//             username: "admin".to_string(),
//             display_name: "Administrator".to_string(),
//             role: UserRole::Admin,
//         },
//         User {
//             id: 2,
//             username: "editor".to_string(),
//             display_name: "Content Editor".to_string(),
//             role: UserRole::Editor,
//         },
//     ];
//     users
// }


#[component]
pub  fn Users() -> Element {
    println!("wtf");

    // let users_resource = use_resource(|| async move {
    //     match get_users_server().await {
    //         Ok(users) => users,
    //         Err(_) => Vec::new(),
    //     }
    // });
    // let users_resource = use_signal(move || async move { test_users().await });
    let users = use_server_future(get_users_server)?.value();
    println!("{:#?}", users);


    rsx! {
        div { class: "container mx-auto px-4 py-8",
            h1 { class: "text-3xl font-bold mb-8", "User Managements" },
            match users() {
                None => rsx! {
                    div { class: "bg-gray-800 rounded-lg p-8 text-center",
                        div { class: "animate-pulse grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6",
                            div { class: "h-8 bg-gray-700 rounded w-1/4 mx-auto" },
                            div { class: "h-64 bg-gray-700 rounded mt-8" },
                        },
                    },
                },
                Some(Ok(users)) if users.is_empty() => rsx! {
                    div { class: "bg-gray-800 rounded-lg p-8 text-center",
                        h2 { class: "text-2xl font-bold", "No Users Found" },
                        p { class: "text-gray-400 mt-2", "There are no users in the system yet." },
                    },
                },
                Some(Ok(users)) => {
                    let user_cards = users.iter().map(|user| {
                        let role_class = match user.role {
                            UserRole::Admin => "bg-red-900 text-red-200",
                            UserRole::Editor => "bg-blue-900 text-blue-200",
                            UserRole::Author => "bg-green-900 text-green-200",
                            UserRole::Viewer => "bg-purple-900 text-purple-200",
                            UserRole::Subscriber => "bg-gray-700 text-gray-300",
                        };
                        let user_id = user.id;
                        let username = user.username.clone();
                        let display_name = user.display_name.clone();
                        let role_str = format!("{:?}", user.role);
                        rsx! {
                            div { key: "{user_id}", class: "bg-gray-700 rounded-lg p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow mb-4 border border-gray-600",
                                div { class: "flex-1 flex flex-col sm:flex-row items-center gap-4 text-left w-full",
                                    div { class: "flex flex-col min-w-0 flex-1",
                                        div { class: "text-gray-400 text-xs uppercase tracking-wide", "ID" },
                                        div { class: "text-gray-300 font-mono text-sm", "{user_id}" },
                                    },
                                    div { class: "flex flex-col min-w-0 flex-1",
                                        div { class: "text-gray-400 text-xs uppercase tracking-wide", "Username" },
                                        div { class: "text-white font-semibold text-base break-all", "{username}" },
                                    },
                                    div { class: "flex flex-col min-w-0 flex-1",
                                        div { class: "text-gray-400 text-xs uppercase tracking-wide", "Display Name" },
                                        div { class: "text-white text-base break-all", "{display_name}" },
                                    },
                                    div { class: "flex flex-col min-w-0 flex-1",
                                        div { class: "text-gray-400 text-xs uppercase tracking-wide", "Role" },
                                        div { class: "inline-block px-2 py-1 text-xs rounded-full {role_class}", "{role_str}" },
                                    },
                                },
                                div { class: "flex items-center gap-2 mt-4 sm:mt-0",
                                    button { class: "text-blue-400 hover:text-blue-300 px-3 py-1 rounded bg-gray-800 border border-gray-600 cursor-not-allowed opacity-50", disabled: true, "Edit" },
                                },
                            }
                        }
                    }).collect::<Vec<_>>();
                    rsx! {
                        div { class: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6",
                            {user_cards.into_iter()},
                        }
                    }
                },
                Some(Err(_)) => rsx! {
                    div { class: "bg-gray-800 rounded-lg p-8 text-center",
                        h2 { class: "text-2xl font-bold text-red-400", "Error Loading Users" },
                        p { class: "text-gray-400 mt-2", "There was a problem loading the users. Please try again later." },
                    },
                },
            },
        }
    }
}
