use dioxus::prelude::*;
use crate::models::{Post, User};
use crate::models::post as post_model;

// Post-related server functions
#[server(GetPostsServer)]
pub async fn get_posts_server() -> Result<Vec<Post>, ServerFnError> {
    // Debug log
    eprintln!("Attempting to get all posts from database");

    // Get posts from the database
    match post_model::get_all_posts() {
        Ok(posts) => {
            eprintln!("Successfully retrieved {} posts", posts.len());
            Ok(posts)
        },
        Err(e) => {
            eprintln!("Error getting posts: {}", e);
            // Return empty vector if database fails
            Ok(Vec::new())
        }
    }
}

#[server(GetPostByIdServer)]
pub async fn get_post_by_id_server(id: usize) -> Result<Option<Post>, ServerFnError> {
    // Get post from the database
    match post_model::get_post_by_id(id) {
        Ok(post) => Ok(post),
        Err(e) => {
            eprintln!("Error getting post by id: {}", e);
            // Return None if database fails
            Ok(None)
        }
    }
}

#[server(CreatePostServer)]
pub async fn create_post_server(new_post: Post) -> Result<Post, ServerFnError> {
    // Debug log
    eprintln!("create_post_server called with title: {}", new_post.title);

    // Create post in the database
    match post_model::create_post(new_post.clone()) {
        Ok(post) => Ok(post),
        Err(e) => {
            eprintln!("Error creating post: {}", e);
            // Return the error to the client
            Err(ServerFnError::ServerError(format!("Failed to create post: {}", e)))
        }
    }
}

#[server(UpdatePostServer)]
pub async fn update_post_server(id: usize, title: Option<String>, body: Option<String>,
                               published: Option<bool>, category: Option<Option<String>>,
                               tags: Option<Vec<String>>) -> Result<Option<Post>, ServerFnError> {
    // Update post in the database
    match post_model::update_post(id, title.clone(), body.clone(), published, category.clone(), tags.clone()) {
        Ok(updated_post) => Ok(updated_post),
        Err(e) => {
            eprintln!("Error updating post: {}", e);
            // Return the error to the client
            Err(ServerFnError::ServerError(format!("Failed to update post: {}", e)))
        }
    }
}

#[server(DeletePostServer)]
pub async fn delete_post_server(id: usize) -> Result<bool, ServerFnError> {
    // Delete post from the database
    match post_model::delete_post(id) {
        Ok(success) => Ok(success),
        Err(e) => {
            eprintln!("Error deleting post: {}", e);
            // Return the error to the client
            Err(ServerFnError::ServerError(format!("Failed to delete post: {}", e)))
        }
    }
}

#[server(GetPublishedPostsServer)]
pub async fn get_published_posts_server() -> Result<Vec<Post>, ServerFnError> {
    // Get published posts from the database
    match post_model::get_published_posts() {
        Ok(posts) => Ok(posts),
        Err(e) => {
            eprintln!("Error getting published posts: {}", e);
            // Return empty vector if database fails
            Ok(Vec::new())
        }
    }
}

// User-related server functions
#[server(GetUsersServer)]
pub async fn get_users_server() -> Result<Vec<User>, ServerFnError> {
    // Debug log
    eprintln!("Attempting to get all users");

    let users = crate::models::user::USERS.lock().unwrap().clone();
    eprintln!("Successfully retrieved {} users", users.len());
    Ok(users)
}

#[server(GetUserByIdServer)]
pub async fn get_user_by_id_server(id: usize) -> Result<Option<User>, ServerFnError> {
    let users = crate::models::user::USERS.lock().unwrap();
    let user = users.iter().find(|u| u.id == id).cloned();
    Ok(user)
}

// Statistics functions
#[server(GetStatsServer)]
pub async fn get_stats_server() -> Result<DashboardStats, ServerFnError> {
    // Get posts from the database
    let posts = match post_model::get_all_posts() {
        Ok(db_posts) => db_posts,
        Err(e) => {
            eprintln!("Error getting posts for stats: {}", e);
            // Return empty vector if database fails
            Vec::new()
        }
    };

    let users = crate::models::user::USERS.lock().unwrap();

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
