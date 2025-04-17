#[allow(unused_imports)]
use dioxus::prelude::*;
#[allow(unused_imports)]
use crate::models::{Post, User, POSTS, USERS};
#[allow(unused_imports)]
use crate::models::post as post_model;

// Post-related server functions
#[server(GetPostsServer)]
pub async fn get_posts_server() -> Result<Vec<Post>, ServerFnError> {
    // Try to get posts from the database
    match post_model::get_all_posts() {
        Ok(posts) => Ok(posts),
        Err(e) => {
            eprintln!("Error getting posts: {}", e);
            // Fallback to in-memory posts if database fails
            let posts = POSTS.lock().unwrap().clone();
            Ok(posts)
        }
    }
}

#[server(GetPostByIdServer)]
pub async fn get_post_by_id_server(id: usize) -> Result<Option<Post>, ServerFnError> {
    // Try to get post from the database
    match post_model::get_post_by_id(id) {
        Ok(post) => Ok(post),
        Err(e) => {
            eprintln!("Error getting post by id: {}", e);
            // Fallback to in-memory posts if database fails
            let posts = POSTS.lock().unwrap();
            let post = posts.iter().find(|p| p.id == id).cloned();
            Ok(post)
        }
    }
}

#[server(CreatePostServer)]
pub async fn create_post_server(new_post: Post) -> Result<Post, ServerFnError> {
    // Debug log
    eprintln!("create_post_server called with title: {}", new_post.title);

    // Try to create post in the database
    match post_model::create_post(new_post.clone()) {
        Ok(post) => {
            // Update in-memory store to keep it in sync
            let mut posts = POSTS.lock().unwrap();
            posts.push(post.clone());
            Ok(post)
        },
        Err(e) => {
            eprintln!("Error creating post: {}", e);
            // Fallback to in-memory posts if database fails
            let mut posts = POSTS.lock().unwrap();
            let id = posts.len() + 1;
            let mut post = new_post;
            post.id = id;
            posts.push(post.clone());
            Ok(post)
        }
    }
}

#[server(UpdatePostServer)]
pub async fn update_post_server(id: usize, title: Option<String>, body: Option<String>,
                               published: Option<bool>, category: Option<Option<String>>,
                               tags: Option<Vec<String>>) -> Result<Option<Post>, ServerFnError> {
    // Try to update post in the database
    match post_model::update_post(id, title.clone(), body.clone(), published, category.clone(), tags.clone()) {
        Ok(updated_post) => {
            // Update in-memory store to keep it in sync
            if let Some(post_data) = &updated_post {
                let mut posts = POSTS.lock().unwrap();
                if let Some(post) = posts.iter_mut().find(|p| p.id == id) {
                    *post = post_data.clone();
                }
            }
            Ok(updated_post)
        },
        Err(e) => {
            eprintln!("Error updating post: {}", e);
            // Fallback to in-memory posts if database fails
            let mut posts = POSTS.lock().unwrap();
            if let Some(post) = posts.iter_mut().find(|p| p.id == id) {
                post.update(title, body, published, category, tags);
                return Ok(Some(post.clone()));
            }
            Ok(None)
        }
    }
}

#[server(DeletePostServer)]
pub async fn delete_post_server(id: usize) -> Result<bool, ServerFnError> {
    // Try to delete post from the database
    match post_model::delete_post(id) {
        Ok(success) => {
            if success {
                // Update in-memory store to keep it in sync
                let mut posts = POSTS.lock().unwrap();
                posts.retain(|p| p.id != id);
            }
            Ok(success)
        },
        Err(e) => {
            eprintln!("Error deleting post: {}", e);
            // Fallback to in-memory posts if database fails
            let mut posts = POSTS.lock().unwrap();
            let initial_len = posts.len();
            posts.retain(|p| p.id != id);
            Ok(posts.len() < initial_len)
        }
    }
}

#[server(GetPublishedPostsServer)]
pub async fn get_published_posts_server() -> Result<Vec<Post>, ServerFnError> {
    // Try to get published posts from the database
    match post_model::get_published_posts() {
        Ok(posts) => Ok(posts),
        Err(e) => {
            eprintln!("Error getting published posts: {}", e);
            // Fallback to in-memory posts if database fails
            let posts = POSTS.lock().unwrap();
            Ok(posts.iter().filter(|p| p.published).cloned().collect())
        }
    }
}

// User-related server functions
#[server(GetUsersServer)]
pub async fn get_users_server() -> Result<Vec<User>, ServerFnError> {
    let users = USERS.lock().unwrap().clone();
    Ok(users)
}

#[server(GetUserByIdServer)]
pub async fn get_user_by_id_server(id: usize) -> Result<Option<User>, ServerFnError> {
    let users = USERS.lock().unwrap();
    let user = users.iter().find(|u| u.id == id).cloned();
    Ok(user)
}

// Statistics functions
#[server(GetStatsServer)]
pub async fn get_stats_server() -> Result<DashboardStats, ServerFnError> {
    // Try to get posts from the database
    let posts = match post_model::get_all_posts() {
        Ok(db_posts) => db_posts,
        Err(e) => {
            eprintln!("Error getting posts for stats: {}", e);
            // Fallback to in-memory posts
            POSTS.lock().unwrap().clone()
        }
    };

    let users = USERS.lock().unwrap();

    let total_posts = posts.len();
    let published_posts = posts.iter().filter(|p| p.published).count();
    let draft_posts = total_posts - published_posts;

    let categories = posts.iter()
        .filter_map(|p| p.category.clone())
        .collect::<Vec<String>>();

    let unique_categories = categories.iter()
        .collect::<std::collections::HashSet<_>>()
        .len();

    let stats = DashboardStats {
        total_posts,
        published_posts,
        draft_posts,
        total_users: users.len(),
        unique_categories,
    };

    Ok(stats)
}

#[derive(Clone, Debug, serde::Serialize, serde::Deserialize)]
pub struct DashboardStats {
    pub total_posts: usize,
    pub published_posts: usize,
    pub draft_posts: usize,
    pub total_users: usize,
    pub unique_categories: usize,
}
