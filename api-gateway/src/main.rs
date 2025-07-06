mod middlewares;
mod routes;
mod controllers;
mod services;

use axum::{middleware, Router};
use axum::routing::get;
use middlewares::gate_way_middlewares ;
use crate::routes::authentication_routes::authentication_routes;
use crate::routes::file_sharing_routes::file_sharing_routes;
use crate::routes::payments_routes::payment_routes;
use crate::routes::url_shortner_routes::url_shortner_routes;

#[tokio::main]
async fn main() {
    tracing::info!("creating the Routing Schema") ;

    tracing_subscriber::fmt::init();

    let app = routes();


    tracing::info!("Going to start the server") ;

    // in ec2 instance we will map port 80 with 8080 via running as the container
    let tcp_listener = tokio::net::TcpListener::bind("0.0.0.0:8080").await.unwrap() ;

    tracing::info!("Server is going listening on port {}", tcp_listener.local_addr().unwrap().port() );
    axum::serve(tcp_listener, app).await.unwrap()
}



fn routes() -> Router {
    Router::new()
        .route("/example", get(|| async { "Basic Route" }).layer(middleware::from_fn(gate_way_middlewares::example_middleware)))
        .route("/{shorten_url}", get(|| async {
            tracing::info!("this route takes care of the url's whether it gonna be file sharing or shorten url website");
        }))
        .nest("/authentication", authentication_routes())
        .nest("/url-shortner", url_shortner_routes())
        .nest("/file-sharing", file_sharing_routes())
        .nest("/payment-routes", payment_routes())
}