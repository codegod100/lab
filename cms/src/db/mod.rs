#[cfg(not(target_arch = "wasm32"))]
pub mod post_repository;

#[cfg(not(target_arch = "wasm32"))]
use once_cell::sync::Lazy;
#[cfg(not(target_arch = "wasm32"))]
use r2d2::Pool;
#[cfg(not(target_arch = "wasm32"))]
use r2d2_sqlite::SqliteConnectionManager;
#[cfg(not(target_arch = "wasm32"))]
use rusqlite::Error as SqliteError;
#[cfg(not(target_arch = "wasm32"))]
use std::path::Path;

#[cfg(target_arch = "wasm32")]
use crate::models::Post;
#[cfg(target_arch = "wasm32")]
use std::sync::{Arc, Mutex};

// Re-export the appropriate implementation based on target
#[cfg(not(target_arch = "wasm32"))]
pub use native::*;
#[cfg(target_arch = "wasm32")]
pub use wasm::*;

// Native (non-WASM) implementation using SQLite
#[cfg(not(target_arch = "wasm32"))]
pub mod native {
    use super::*;

    // Define a type alias for our SQLite connection pool
    pub type DbPool = Pool<SqliteConnectionManager>;
    pub type DbError = SqliteError;

    // Global connection pool
    pub static DB_POOL: Lazy<DbPool> = Lazy::new(|| {
        init_db_pool().expect("Failed to initialize database pool")
    });

    // Initialize the database pool
    fn init_db_pool() -> Result<DbPool, DbError> {
        let db_path = "cms_data.db";
        let manager = SqliteConnectionManager::file(db_path);
        let pool = Pool::new(manager).expect("Failed to create connection pool");

        // Initialize the database schema
        let conn = pool.get().expect("Failed to get connection from pool");
        init_schema(&conn)?;

        Ok(pool)
    }

    // Initialize the database schema
    fn init_schema(conn: &rusqlite::Connection) -> Result<(), DbError> {
        // Create posts table
        conn.execute(
            "CREATE TABLE IF NOT EXISTS posts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                body TEXT NOT NULL,
                published BOOLEAN NOT NULL DEFAULT 0,
                category TEXT,
                created_at INTEGER NOT NULL,
                updated_at INTEGER NOT NULL
            )",
            [],
        )?;

        // Create tags table
        conn.execute(
            "CREATE TABLE IF NOT EXISTS tags (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE
            )",
            [],
        )?;

        // Create post_tags junction table
        conn.execute(
            "CREATE TABLE IF NOT EXISTS post_tags (
                post_id INTEGER NOT NULL,
                tag_id INTEGER NOT NULL,
                PRIMARY KEY (post_id, tag_id),
                FOREIGN KEY (post_id) REFERENCES posts (id) ON DELETE CASCADE,
                FOREIGN KEY (tag_id) REFERENCES tags (id) ON DELETE CASCADE
            )",
            [],
        )?;

        Ok(())
    }

    // Check if the database exists
    #[allow(dead_code)]
    pub fn db_exists() -> bool {
        Path::new("cms_data.db").exists()
    }
}

// WebAssembly implementation using in-memory storage
#[cfg(target_arch = "wasm32")]
pub mod wasm {
    use super::*;
    use once_cell::sync::Lazy;
    use std::collections::HashMap;

    // Define error type for WASM
    #[derive(Debug)]
    pub enum DbError {
        NotFound,
        AlreadyExists,
        Other(String),
    }

    // In-memory storage for posts
    pub static DB_POOL: Lazy<Arc<Mutex<HashMap<usize, Post>>>> = Lazy::new(|| {
        Arc::new(Mutex::new(HashMap::new()))
    });

    // Helper functions for WASM
    pub fn get_all_posts() -> Result<Vec<Post>, DbError> {
        let posts = DB_POOL.lock().unwrap();
        let mut result: Vec<Post> = posts.values().cloned().collect();
        result.sort_by(|a, b| b.created_at.cmp(&a.created_at)); // Sort by created_at desc
        Ok(result)
    }

    pub fn get_published_posts() -> Result<Vec<Post>, DbError> {
        let posts = DB_POOL.lock().unwrap();
        let mut result: Vec<Post> = posts.values()
            .filter(|p| p.published)
            .cloned()
            .collect();
        result.sort_by(|a, b| b.created_at.cmp(&a.created_at)); // Sort by created_at desc
        Ok(result)
    }

    pub fn get_post_by_id(id: usize) -> Result<Option<Post>, DbError> {
        let posts = DB_POOL.lock().unwrap();
        Ok(posts.get(&id).cloned())
    }

    pub fn create_post(post: &Post) -> Result<usize, DbError> {
        let mut posts = DB_POOL.lock().unwrap();
        let id = if posts.is_empty() {
            1
        } else {
            posts.keys().max().unwrap_or(&0) + 1
        };

        let mut new_post = post.clone();
        new_post.id = id;
        posts.insert(id, new_post);
        Ok(id)
    }

    pub fn update_post(
        id: usize,
        title: Option<String>,
        body: Option<String>,
        published: Option<bool>,
        category: Option<Option<String>>,
        tags: Option<Vec<String>>,
    ) -> Result<bool, DbError> {
        let mut posts = DB_POOL.lock().unwrap();

        if let Some(post) = posts.get_mut(&id) {
            if let Some(title) = title {
                post.title = title;
            }

            if let Some(body) = body {
                post.body = body;
            }

            if let Some(published) = published {
                post.published = published;
            }

            if let Some(category) = category {
                post.category = category;
            }

            if let Some(tags) = tags {
                post.tags = tags;
            }

            post.updated_at = crate::utils::current_timestamp();
            Ok(true)
        } else {
            Ok(false)
        }
    }

    pub fn delete_post(id: usize) -> Result<bool, DbError> {
        let mut posts = DB_POOL.lock().unwrap();
        Ok(posts.remove(&id).is_some())
    }

    pub fn migrate_posts(posts_to_migrate: &[Post]) -> Result<(), DbError> {
        let mut posts = DB_POOL.lock().unwrap();
        for post in posts_to_migrate {
            posts.insert(post.id, post.clone());
        }
        Ok(())
    }
}