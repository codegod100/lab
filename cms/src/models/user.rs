use serde::{Serialize, Deserialize};
use std::sync::{Arc, Mutex};
use once_cell::sync::Lazy;

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq)]
pub struct User {
    pub id: usize,
    pub username: String,
    pub display_name: String,
    pub role: UserRole,
}

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq)]
pub enum UserRole {
    Admin,
    Editor,
    Author,
    Viewer,
    Subscriber,
}

// Global in-memory store for users
pub static USERS: Lazy<Arc<Mutex<Vec<User>>>> = Lazy::new(|| {
    // Initialize with a default admin user
    let initial_users = vec![
        User {
            id: 1,
            username: "admin".to_string(),
            display_name: "Administrator".to_string(),
            role: UserRole::Admin,
        },
        User {
            id: 2,
            username: "editor".to_string(),
            display_name: "Content Editor".to_string(),
            role: UserRole::Editor,
        },
    ];

    Arc::new(Mutex::new(initial_users))
});
