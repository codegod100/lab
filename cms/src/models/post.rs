use serde::{Serialize, Deserialize};

#[cfg(not(target_arch = "wasm32"))]
/* Removed unused import to reduce warnings */

use crate::utils::current_timestamp;
use crate::db;

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
        #[cfg(target_arch = "wasm32")]
        let now = 1672531200; // January 1, 2023 - fixed timestamp for WASM

        #[cfg(not(target_arch = "wasm32"))]
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

        #[cfg(target_arch = "wasm32")]
        {
            // In WASM, use a fixed timestamp to avoid any issues
            self.updated_at = 1672531200; // January 1, 2023
        }

        #[cfg(not(target_arch = "wasm32"))]
        {
            self.updated_at = current_timestamp();
        }
    }
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
#[cfg(target_arch = "wasm32")]
pub(crate) use wasm_impl::*;

// Re-export DB helper functions at the top level for server use
#[cfg(not(target_arch = "wasm32"))]
pub use native_impl::{
    get_all_posts,
    get_published_posts,
    get_post_by_id,
    create_post,
    update_post,
    delete_post,
};

#[cfg(target_arch = "wasm32")]
pub use wasm_impl::{
    get_all_posts,
    get_published_posts,
    get_post_by_id,
    create_post,
    update_post,
    delete_post,
};
