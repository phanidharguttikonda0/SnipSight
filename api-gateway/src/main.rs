mod middlewares;
mod routes;
mod controllers;
mod services;
mod models;

use axum::{middleware, Router};
use axum::http::{HeaderValue, Method};
use axum::routing::get;
use tower_http::cors::{Any, CorsLayer};
use crate::controllers::url_shortner_handler::redirect_url;
use crate::middlewares::authentication_middlewares::authorization_check;
use crate::routes::authentication_routes::authentication_routes;
use crate::routes::file_sharing_routes::file_sharing_routes;
use crate::routes::payments_routes::payment_routes;
use crate::routes::url_shortner_routes::{url_shortner_routes};
use aws_config::meta::region::RegionProviderChain;
use aws_sdk_ssm::Client;
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
        .allow_origin("https://snipsight.phani.services".parse::<HeaderValue>().unwrap()) // You can use `Exact` or `AllowOrigin::predicate(...)` for specific domains
        .allow_methods(Any)
        .allow_headers(Any);

    let app = routes(cors).await ;
    tracing::info!("built the Router") ;

    tracing::info!("Going to start the server") ;

    // in ec2 instance we will map port 80 with 8080 via running as the container
    let tcp_listener = tokio::net::TcpListener::bind("0.0.0.0:8080").await.unwrap() ;

    tracing::info!("Server is going listening on port {}", tcp_listener.local_addr().unwrap().port() );
    axum::serve(tcp_listener, app).await.unwrap()
}



async fn routes(cors_layer: CorsLayer) -> Router {
    let secret = get_jwt_secret().await;
    let protected_routes = Router::new()
        .nest("/url-shortner", url_shortner_routes())
        .nest("/file-sharing", file_sharing_routes())
        .nest("/payment-routes", payment_routes())
        .layer(middleware::from_fn_with_state(AppState { secret_key: secret }, authorization_check));

    let public_routes = Router::new()
        .nest("/authentication", authentication_routes())
        .route("/{shorten_url}", get(redirect_url));

    Router::new()
        .merge(public_routes)
        .merge(protected_routes)
        .layer(cors_layer)  // ✅ CORS globally

}

async fn get_jwt_secret() -> String {
    // needs to use the ssm to get the secret key
    let region_provider = RegionProviderChain::default_provider().or_else("ap-south-1");
    let config = aws_config::from_env().region(region_provider).load().await;

    // Create the SSM client
    let client = Client::new(&config);

    let param_name = "/snipsight/jwt";
    let result = client.get_parameter().name(param_name).with_decryption(true).send().await.unwrap();
    result.parameter().and_then(|p| p.value()).unwrap().to_string()
}