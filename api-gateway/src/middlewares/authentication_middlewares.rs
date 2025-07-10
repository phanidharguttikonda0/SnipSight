
use axum::middleware::Next;
use axum::{extract::{Request}, response::Response} ;
use axum::body::{to_bytes, Body, Bytes};
use axum::http::StatusCode;
use crate::models::responses::ErrorResponse;
use jsonwebtoken::{decode, DecodingKey, Validation};
use validator::{Validate, ValidationError};
use regex::Regex;
use crate::models::authentication_models::{Claims, Login, Register};


// We are going to use the OAuth
pub async fn authorization_check(mut req: Request, next: Next) -> Result<Response, (StatusCode, ErrorResponse)> {
    // let's learn about how do we design a response for the whole application
    Ok(next.run(req).await)
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

pub async fn sign_in_check(mut req: Request, next: Next) -> Result<Response, (StatusCode,ErrorResponse)>{
    let (mut parts, body) = req.into_parts() ;
    tracing::info!("body was {:?}", body);
    tracing::info!("parts were {:?}", parts);
    // we need to parse the body and get the actual form data
    let bytes:Bytes = match to_bytes(body, usize::MAX).await {
        Ok(bytes) => bytes,
        Err(err) => return Err((StatusCode::BAD_REQUEST, ErrorResponse{
            message: format!("Error while parsing the body: {}", err),
        }))
    };

    let form_data: Login = match serde_urlencoded::from_bytes(&bytes) {
        Ok(form) => form,
        Err(_) => return Err((
            StatusCode::BAD_REQUEST,
            ErrorResponse { message: "Invalid form data".to_string() }
        )),
    };

    if let Err(validation_error) = validate_username_or_mail_id_check(&form_data.username) {
        return Err((
            StatusCode::BAD_REQUEST,
            ErrorResponse { message: validation_error.to_string() }
        ));
    }

    Ok(next.run(Request::from_parts(parts,Body::from(bytes.clone()))).await)
}

pub async fn sign_up_check(mut req: Request, next: Next) -> Result<Response, (StatusCode,ErrorResponse)>{
    let (mut parts, body) = req.into_parts() ;

    let bytes = match to_bytes(body, usize::MAX).await {
        Ok(bytes) => bytes,
        Err(err) => return Err((StatusCode::BAD_REQUEST, ErrorResponse{
            message: format!("Error while parsing the body: {}", err),
        }))
    } ;

    let form_data: Register = match serde_urlencoded::from_bytes(&bytes) {
        Ok(form) => form,
        Err(_) => return Err((
            StatusCode::BAD_REQUEST,
            ErrorResponse { message: "Invalid form data".to_string() }
        )),
    };

    if let Err(validation_error) = form_data.validate() {
        return Err((
            StatusCode::BAD_REQUEST,
            ErrorResponse { message: validation_error.to_string() }
        ));
    }

    Ok(next.run(Request::from_parts(parts,Body::from(bytes.clone()))).await)

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