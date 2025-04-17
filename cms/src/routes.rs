use dioxus::prelude::*;
use crate::pages::dashboard::Dashboard;
use crate::pages::posts::Posts;
use crate::pages::post_detail::PostDetail;
use crate::pages::new_post::NewPost;
use crate::pages::edit_post::EditPost;
use crate::pages::blog::Blog;
use crate::pages::blog_post::BlogPost;
use crate::pages::users::Users;
use crate::pages::not_found::NotFound;

#[derive(Debug, Clone, Routable, PartialEq)]
pub enum Route {
    #[layout(crate::components::Layout)]
    #[route("/")]
    Dashboard {},

    // Post routes
    #[route("/posts")]
    Posts {},
    #[route("/posts/new")]
    NewPost {},
    #[route("/posts/:id")]
    PostDetail { id: usize },
    #[route("/posts/:id/edit")]
    EditPost { id: usize },

    // User routes
    #[route("/users")]
    Users {},

    // Public routes
    #[route("/blog")]
    Blog {},
    #[route("/blog/:id")]
    BlogPost { id: usize },

    // Not found
    #[route("/*")]
    NotFound {},
}
