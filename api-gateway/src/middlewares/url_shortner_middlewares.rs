use axum::{middleware::Next, extract::Request, response::Response};
use axum::body::{to_bytes, Body};
use axum::response::IntoResponse;
use regex::Regex;
use reqwest::RequestBuilder;
use validator::{Validate, ValidationError};
use crate::models::url_shorten_models::UrlShortenModel;



pub fn validate_url_shortner_name(input: &str) -> Result<(), ValidationError> {
    let allowed_chars = Regex::new(r"^[a-zA-Z0-9_-]{5,}$").unwrap();

    let result = allowed_chars.is_match(input) && !input.ends_with('-') ;
    if result {
        Ok(())
    } else {
        Err(ValidationError::new("Invalid Shorten Url Name"))
    }
}


pub async fn create_shorten_url_validation(mut req: Request, next: Next) -> Result<Response, impl IntoResponse>
{
    let (parts, body) = req.into_parts();
    let bytes = match to_bytes(body, 1200).await {
        Ok(b) => b,
        Err(_) => return Err(Response::builder().status(400).body(Body::from("Invalid Body")).unwrap()),
    };


    if let Ok(parsed) = serde_urlencoded::from_bytes::<UrlShortenModel>(&bytes) {
        tracing::info!("Intercepted Form Data: {:?}", parsed);

        match parsed.validate() {
            Ok(_) => {
                tracing::info!("Form Data is valid");
                // rebuild the request from the parts and the body in form of bytes
                let req = Request::from_parts(parts, Body::from(bytes));
                Ok(next.run(req).await)
            },
            Err(err) => {
                tracing::warn!("Failed to validate form data: {:?}", err);
                Err(Response::builder().status(400).body(Body::from(err.to_string())).unwrap())
            }
        }

    } else {
        tracing::warn!("Failed to parse form body");
        Err(Response::builder().status(400).body(Body::from("Invalid Form Data")).unwrap())
    }
}