mod middlewares;
mod handlers;

use axum::{Router};
use axum::routing::{post, get};
use tracing_subscriber;
use crate::handlers::{sign_in_handler, sign_up_handler};

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt::init();
    // input validation is done in the api-gateway itself
    let app = Router::new()
        .route("/", get(|| async {
            "Just a Test whether Server working properly or not"
        }))
    .route("/sign-in/{username}/{password}", post(sign_in_handler))
    .route("/sign-up/{username}/{password}/{mail_id}/{mobile}", post(sign_up_handler));

    let tcp_listener = tokio::net::TcpListener::bind("0.0.0.0:9090").await.unwrap();
    tracing::info!("Listening on {}", tcp_listener.local_addr().unwrap());
    axum::serve(tcp_listener, app).await.unwrap()

}
