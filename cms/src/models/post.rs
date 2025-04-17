use serde::{Serialize, Deserialize};
use std::sync::{Arc, Mutex};
use once_cell::sync::Lazy;
use crate::utils::current_timestamp;
use crate::db;

#[cfg(not(target_arch = "wasm32"))]
use crate::db::post_repository;

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq)]
pub struct Post {
    pub id: usize,
    pub title: String,
    pub body: String,
    pub published: bool,
    pub category: Option<String>,
    pub tags: Vec<String>,
    pub created_at: u64,
    pub updated_at: u64,
}

impl Post {
    pub fn new(title: String, body: String, published: bool, category: Option<String>, tags: Vec<String>) -> Self {
        let now = current_timestamp();

        Self {
            id: 0, // Will be set when added to the store
            title,
            body,
            published,
            category,
            tags,
            created_at: now,
            updated_at: now,
        }
    }

    pub fn update(&mut self, title: Option<String>, body: Option<String>, published: Option<bool>,
                  category: Option<Option<String>>, tags: Option<Vec<String>>) {
        if let Some(title) = title {
            self.title = title;
        }

        if let Some(body) = body {
            self.body = body;
        }

        if let Some(published) = published {
            self.published = published;
        }

        if let Some(category) = category {
            self.category = category;
        }

        if let Some(tags) = tags {
            self.tags = tags;
        }

        self.updated_at = current_timestamp();
    }
}

// Global in-memory store for posts - kept for backward compatibility
// but now backed by database (SQLite for native, in-memory for WASM)
#[allow(dead_code)]
pub static POSTS: Lazy<Arc<Mutex<Vec<Post>>>> = Lazy::new(|| {
    // Initialize with sample data if the database is empty
    let initial_posts = create_sample_posts();

    #[cfg(not(target_arch = "wasm32"))]
    {
        // Native implementation using SQLite
        let conn = db::DB_POOL.get().expect("Failed to get database connection");

        // Check if we have any posts
        let posts = post_repository::get_all_posts(&conn).unwrap_or_default();

        if posts.is_empty() {
            // Migrate initial posts to the database
            let mut conn_mut = db::DB_POOL.get().expect("Failed to get database connection");
            if let Err(e) = post_repository::migrate_posts(&mut conn_mut, &initial_posts) {
                eprintln!("Failed to migrate initial posts to database: {}", e);
            }

            return Arc::new(Mutex::new(initial_posts));
        } else {
            // Use existing posts from the database
            return Arc::new(Mutex::new(posts));
        }
    }

    #[cfg(target_arch = "wasm32")]
    {
        // WASM implementation using in-memory storage
        let posts = match db::get_all_posts() {
            Ok(posts) if !posts.is_empty() => posts,
            _ => {
                // Migrate initial posts to the in-memory store
                if let Err(e) = db::migrate_posts(&initial_posts) {
                    eprintln!("Failed to migrate initial posts to in-memory store: {:?}", e);
                }
                initial_posts
            }
        };

        Arc::new(Mutex::new(posts))
    }
});

// Create sample posts for initialization
fn create_sample_posts() -> Vec<Post> {
    let now = current_timestamp();
    vec![
        Post {
            id: 1,
            title: "Welcome to the CMS".to_string(),
            body: "This is your first post in the content management system. You can edit or delete it.".to_string(),
            published: true,
            category: Some("Announcements".to_string()),
            tags: vec!["welcome".to_string(), "getting-started".to_string()],
            created_at: now - 86400,
            updated_at: now - 86400,
        },
        Post {
            id: 2,
            title: "How to Use This CMS".to_string(),
            body: "This CMS allows you to create, edit, and manage your content. Use the dashboard to see an overview of your site.".to_string(),
            published: true,
            category: Some("Tutorials".to_string()),
            tags: vec!["tutorial".to_string(), "help".to_string()],
            created_at: now - 43200,
            updated_at: now - 43200,
        },
        Post {
            id: 3,
            title: "Draft Post Example".to_string(),
            body: "This is an example of a draft post. It won't be visible on the public blog until you publish it.".to_string(),
            published: false,
            category: Some("Examples".to_string()),
            tags: vec!["draft".to_string(), "example".to_string()],
            created_at: now - 21600,
            updated_at: now - 21600,
        },
    ]
}

// Helper functions to interact with the database

// Native (non-WASM) implementation
#[cfg(not(target_arch = "wasm32"))]
mod native_impl {
    use super::*;
    use crate::db::post_repository;
    use rusqlite::Error as SqliteError;

    #[allow(dead_code)]
    pub fn get_all_posts() -> Result<Vec<Post>, SqliteError> {
        let conn = db::DB_POOL.get().expect("Failed to get database connection");
        post_repository::get_all_posts(&conn)
    }

    #[allow(dead_code)]
    pub fn get_published_posts() -> Result<Vec<Post>, SqliteError> {
        let conn = db::DB_POOL.get().expect("Failed to get database connection");
        post_repository::get_published_posts(&conn)
    }

    #[allow(dead_code)]
    pub fn get_post_by_id(id: usize) -> Result<Option<Post>, SqliteError> {
        let conn = db::DB_POOL.get().expect("Failed to get database connection");
        post_repository::get_post_by_id(&conn, id)
    }

    #[allow(dead_code)]
    pub fn create_post(post: Post) -> Result<Post, SqliteError> {
        let mut conn = db::DB_POOL.get().expect("Failed to get database connection");
        let post_id = post_repository::create_post(&mut conn, &post)?;

        // Return the post with the new ID
        let mut new_post = post;
        new_post.id = post_id;
        Ok(new_post)
    }

    #[allow(dead_code)]
    pub fn update_post(
        id: usize,
        title: Option<String>,
        body: Option<String>,
        published: Option<bool>,
        category: Option<Option<String>>,
        tags: Option<Vec<String>>
    ) -> Result<Option<Post>, SqliteError> {
        let mut conn = db::DB_POOL.get().expect("Failed to get database connection");

        // Update the post
        let success = post_repository::update_post(&mut conn, id, title.clone(), body.clone(), published, category.clone(), tags.clone())?;

        if success {
            // Get the updated post
            get_post_by_id(id)
        } else {
            Ok(None)
        }
    }

    #[allow(dead_code)]
    pub fn delete_post(id: usize) -> Result<bool, SqliteError> {
        let mut conn = db::DB_POOL.get().expect("Failed to get database connection");
        post_repository::delete_post(&mut conn, id)
    }
}

// WASM implementation
#[cfg(target_arch = "wasm32")]
mod wasm_impl {
    use super::*;
    use crate::db::DbError;

    #[allow(dead_code)]
    pub fn get_all_posts() -> Result<Vec<Post>, DbError> {
        db::get_all_posts()
    }

    #[allow(dead_code)]
    pub fn get_published_posts() -> Result<Vec<Post>, DbError> {
        db::get_published_posts()
    }

    #[allow(dead_code)]
    pub fn get_post_by_id(id: usize) -> Result<Option<Post>, DbError> {
        db::get_post_by_id(id)
    }

    #[allow(dead_code)]
    pub fn create_post(post: Post) -> Result<Post, DbError> {
        let post_id = db::create_post(&post)?;

        // Return the post with the new ID
        let mut new_post = post;
        new_post.id = post_id;
        Ok(new_post)
    }

    #[allow(dead_code)]
    pub fn update_post(
        id: usize,
        title: Option<String>,
        body: Option<String>,
        published: Option<bool>,
        category: Option<Option<String>>,
        tags: Option<Vec<String>>
    ) -> Result<Option<Post>, DbError> {
        let success = db::update_post(id, title.clone(), body.clone(), published, category.clone(), tags.clone())?;

        if success {
            // Get the updated post
            get_post_by_id(id)
        } else {
            Ok(None)
        }
    }

    #[allow(dead_code)]
    pub fn delete_post(id: usize) -> Result<bool, DbError> {
        db::delete_post(id)
    }
}

// Use the appropriate implementation based on target
#[cfg(not(target_arch = "wasm32"))]
pub(crate) use native_impl::*;

#[cfg(target_arch = "wasm32")]
pub(crate) use wasm_impl::*;
