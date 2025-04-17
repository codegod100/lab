use dioxus::prelude::*;

#[derive(Debug, Clone, Routable, PartialEq)]
#[rustfmt::skip]
pub enum Route {
    #[layout(crate::components::layout::Layout)]
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
    #[route("/:..")]
    NotFound {},
}
