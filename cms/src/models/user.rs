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
#[allow(dead_code)]
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
        // Add more users for testing
        User {
            id: 3,
            username: "author".to_string(),
            display_name: "Content Author".to_string(),
            role: UserRole::Author,
        },
        User {
            id: 4,
            username: "viewer".to_string(),
            display_name: "Content Viewer".to_string(),
            role: UserRole::Viewer,
        },
    ];

    println!("Initializing USERS static variable with {} users", initial_users.len());
    Arc::new(Mutex::new(initial_users))
});

// Helper function to get all users
// This can be used as a fallback if the static variable is not accessible
#[allow(dead_code)]
pub fn get_all_users() -> Vec<User> {
    match USERS.lock() {
        Ok(guard) => guard.clone(),
        Err(_) => {
            // If we can't access the static variable, return a default set of users
            vec![
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
            ]
        }
    }
}
