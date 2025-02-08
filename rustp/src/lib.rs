use extism_pdk::*;
use serde::{Deserialize, Serialize};
use axum::{
    routing::{get, post},
    http::StatusCode,
    Json, Router,
};

#[tokio::main]
async fn main() {
    // initialize tracing
    tracing_subscriber::fmt::init();

    // build our application with a route
    let app = Router::new()
        // // `GET /` goes to `root`
        // .route("/", get(root))
        // // `POST /users` goes to `create_user`
        // .route("/users", post(create_user));

    // run our app with hyper, listening globally on port 3000
    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await.unwrap();
    axum::serve(listener, app).await.unwrap();
}
// start with something simple
#[plugin_fn]
pub fn greet(name: String) -> FnResult<String> {
    Ok(format!("Hello, {}!", name))
}

// use json data for inputs and outputs
#[derive(FromBytes, Deserialize, PartialEq, Debug)]
#[encoding(Json)]
struct Add {
    left: i32,
    right: i32,
}
#[derive(ToBytes, Serialize, PartialEq, Debug)]
#[encoding(Json)]
struct Sum {
    value: i32,
}

#[plugin_fn]
pub fn add(input: Add) -> FnResult<Sum> {
    Ok(Sum {
        value: input.left + input.right,
    })
}
