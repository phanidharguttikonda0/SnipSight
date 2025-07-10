use axum::Router;
use axum::routing::post;
use crate::controllers::authentication_handler::{sign_in, sign_up};

pub fn authentication_routes() -> Router {
    Router::new()
        .route("/sign-in", post(sign_in))
        .route("/sign-up", post(sign_up))
        .route("/forgot-credentials", post(|| async{
            tracing::info!("handling forgot request") ;
        })) 
}