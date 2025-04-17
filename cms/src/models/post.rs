use serde::{Serialize, Deserialize};
use std::sync::{Arc, Mutex};
use once_cell::sync::Lazy;
use std::time::{SystemTime, UNIX_EPOCH};

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
        let now = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs();

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

        self.updated_at = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs();
    }
}

// Global in-memory store for posts
#[allow(dead_code)]
pub static POSTS: Lazy<Arc<Mutex<Vec<Post>>>> = Lazy::new(|| {
    // Initialize with some sample data
    let initial_posts = vec![
        Post {
            id: 1,
            title: "Welcome to the CMS".to_string(),
            body: "This is your first post in the content management system. You can edit or delete it.".to_string(),
            published: true,
            category: Some("Announcements".to_string()),
            tags: vec!["welcome".to_string(), "getting-started".to_string()],
            created_at: SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_secs() - 86400,
            updated_at: SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_secs() - 86400,
        },
        Post {
            id: 2,
            title: "How to Use This CMS".to_string(),
            body: "This CMS allows you to create, edit, and manage your content. Use the dashboard to see an overview of your site.".to_string(),
            published: true,
            category: Some("Tutorials".to_string()),
            tags: vec!["tutorial".to_string(), "help".to_string()],
            created_at: SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_secs() - 43200,
            updated_at: SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_secs() - 43200,
        },
        Post {
            id: 3,
            title: "Draft Post Example".to_string(),
            body: "This is an example of a draft post. It won't be visible on the public blog until you publish it.".to_string(),
            published: false,
            category: Some("Examples".to_string()),
            tags: vec!["draft".to_string(), "example".to_string()],
            created_at: SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_secs() - 21600,
            updated_at: SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_secs() - 21600,
        },
    ];

    Arc::new(Mutex::new(initial_posts))
});
