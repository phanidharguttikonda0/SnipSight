use axum::Router;
use axum::routing::post;

pub fn authentication_routes() -> Router {
    Router::new()
        .route("/sign-in", post(|| async{
            tracing::info!("handling sign-in request") ;
        }))
        .route("/sign-up", post(|| async{
            tracing::info!("handling sign-up request") ;
        }))
        .route("/forgot-credentials", post(|| async{
            tracing::info!("handling forgot request") ;
        })) 
}