mod middlewares;
mod routes;
mod controllers;
mod services;
mod models;

use axum::{middleware, Router};
use axum::http::Method;
use axum::routing::get;
use tower_http::cors::{Any, CorsLayer};
use middlewares::authentication_middlewares;
use crate::middlewares::authentication_middlewares::authorization_check;
use crate::routes::authentication_routes::authentication_routes;
use crate::routes::file_sharing_routes::file_sharing_routes;
use crate::routes::payments_routes::payment_routes;
use crate::routes::url_shortner_routes::{url_shortner_routes};
#[derive(Clone)]
pub struct AppState {
    pub secret_key: String,
}

#[tokio::main]
async fn main() {
    tracing::info!("creating the Routing Schema") ;

    tracing_subscriber::fmt::init();

    // Build the CORS layer
    let cors = CorsLayer::new()
        .allow_origin(Any) // You can use `Exact` or `AllowOrigin::predicate(...)` for specific domains
        .allow_methods([Method::GET, Method::POST, Method::PUT, Method::DELETE])
        .allow_headers(Any);

    let app = routes(cors).await ;
    tracing::info!("built the Router") ;

    tracing::info!("Going to start the server") ;

    // in ec2 instance we will map port 80 with 8080 via running as the container
    let tcp_listener = tokio::net::TcpListener::bind("127.0.0.1:8080").await.unwrap() ;

    tracing::info!("Server is going listening on port {}", tcp_listener.local_addr().unwrap().port() );
    axum::serve(tcp_listener, app).await.unwrap()
}



async fn routes(cors_layer: CorsLayer) -> Router {
    let secret = get_jwt_secret().await;
    Router::new()
        .route("/{shorten_url}", get(|| async {
            tracing::info!("this route takes care of the url's whether it gonna be file sharing or shorten url website");
        }))
        .nest("/url-shortner", url_shortner_routes())
        .nest("/file-sharing", file_sharing_routes())
        .nest("/payment-routes", payment_routes())
        .layer(middleware::from_fn_with_state(AppState{ secret_key: secret}, authorization_check))
        .nest("/authentication", authentication_routes())
        .layer(cors_layer)
}

async fn get_jwt_secret() -> String {
    // needs to use the ssm to get the secret key
    String::from("secret")
}