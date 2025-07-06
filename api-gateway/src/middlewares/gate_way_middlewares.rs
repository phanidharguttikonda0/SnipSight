
use axum::middleware::Next;
use axum::{extract::Request} ;


// We are going to use the OAuth
pub async fn authorization_check(mut req: Request, next: Next) {

}

pub async fn example_middleware(req: Request, next: Next) {
    tracing::info!("Just a Middleware Execution");
    next.run(req).await;
}