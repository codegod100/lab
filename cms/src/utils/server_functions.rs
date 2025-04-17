#[allow(unused_imports)]
use dioxus::prelude::*;
#[allow(unused_imports)]
use crate::models::{Post, User, POSTS, USERS};

// Post-related server functions
#[server(GetPostsServer)]
pub async fn get_posts_server() -> Result<Vec<Post>, ServerFnError> {
    let posts = POSTS.lock().unwrap().clone();
    Ok(posts)
}

#[server(GetPostByIdServer)]
pub async fn get_post_by_id_server(id: usize) -> Result<Option<Post>, ServerFnError> {
    let posts = POSTS.lock().unwrap();
    let post = posts.iter().find(|p| p.id == id).cloned();
    Ok(post)
}

#[server(CreatePostServer)]
pub async fn create_post_server(new_post: Post) -> Result<Post, ServerFnError> {
    let mut posts = POSTS.lock().unwrap();
    let id = posts.len() + 1;
    let mut post = new_post;
    post.id = id;
    posts.push(post.clone());
    Ok(post)
}

#[server(UpdatePostServer)]
pub async fn update_post_server(id: usize, title: Option<String>, body: Option<String>,
                               published: Option<bool>, category: Option<Option<String>>,
                               tags: Option<Vec<String>>) -> Result<Option<Post>, ServerFnError> {
    let mut posts = POSTS.lock().unwrap();

    if let Some(post) = posts.iter_mut().find(|p| p.id == id) {
        post.update(title, body, published, category, tags);
        return Ok(Some(post.clone()));
    }

    Ok(None)
}

#[server(DeletePostServer)]
pub async fn delete_post_server(id: usize) -> Result<bool, ServerFnError> {
    let mut posts = POSTS.lock().unwrap();
    let initial_len = posts.len();
    posts.retain(|p| p.id != id);

    Ok(posts.len() < initial_len)
}

#[server(GetPublishedPostsServer)]
pub async fn get_published_posts_server() -> Result<Vec<Post>, ServerFnError> {
    let posts = POSTS.lock().unwrap();
    Ok(posts.iter().filter(|p| p.published).cloned().collect())
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
    let posts = POSTS.lock().unwrap();
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
