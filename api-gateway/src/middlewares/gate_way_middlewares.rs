
use axum::middleware::Next;
use axum::{extract::Request} ;
use jsonwebtoken::{decode, DecodingKey, Validation};
use crate::models::authentication_models::Claims;

// We are going to use the OAuth
pub async fn authorization_check(mut req: Request, next: Next) {
    
}

pub async fn check_authorization_header(jwt_secret: String, header: String) -> Result<(i32, String), bool> {
    let result = decode::<Claims>(
        header.as_ref(),
        &DecodingKey::from_secret(jwt_secret.as_ref()),
        &Validation::default(),
    );
    match result {
        Ok(token_data) => {
            tracing::info!("Authorization header decoded successfully");
            Ok((token_data.claims.user_id,token_data.claims.username))
        },
        Err(error) => {
            tracing::error!("error was {:?}", error);
            Err(false)
        }
    }
}

pub async fn example_middleware(req: Request, next: Next) {
    tracing::info!("Just a Middleware Execution");
    next.run(req).await;
}