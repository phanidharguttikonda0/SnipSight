
use axum::middleware::Next;
use axum::{extract::Request} ;
use jsonwebtoken::{decode, DecodingKey, Validation};
use validator::ValidationError;
use regex::Regex;
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


const USERNAME_REGEX: &str = r"^[a-zA-Z0-9_]{3,50}$";
pub fn username_check(value: &str) -> Result<(), ValidationError> {
    let username_check = Regex::new(USERNAME_REGEX).unwrap();
    if username_check.is_match(value) {
        Ok(())
    }else{
        Err(ValidationError::new("Invalid username"))
    }
}
// custom validator
pub fn validate_username_or_mail_id_check(value: &str) -> Result<(),ValidationError> {

    match username_check(value) {
        Ok(_) => return Ok(()),
        Err(_) => {
            if   validator::ValidateEmail::validate_email(&value){
                Ok(())
            }else {
                Err(ValidationError::new("Invalid username or mail-id"))
            }
        }
    }
}

pub fn validate_digits_only(value: &str) -> Result<(), ValidationError> {
    let digits_only = Regex::new(r"^\d{10}$").unwrap(); // Exactly 10 digits
    if digits_only.is_match(value) {
        Ok(())
    } else {
        Err(ValidationError::new("must contain exactly 10 digits"))
    }
}