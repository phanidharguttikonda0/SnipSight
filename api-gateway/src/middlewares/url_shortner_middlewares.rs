use axum::{middleware::Next, extract::Request, response::Response};
use axum::response::IntoResponse;
use hyper::StatusCode;
use regex::Regex;
use validator::ValidationError;

const CUSTOM_NAME_REGEX: &str = r"^(?=[a-zA-Z0-9_-]{5,}$)(?!.*-$)[a-zA-Z_-]*[a-zA-Z_-]?[0-9]+$" ;

pub fn validate_url_shortner_name(name: &str) -> Result<(), ValidationError> {
    if Regex::new(CUSTOM_NAME_REGEX).unwrap().is_match(name) {
        Ok(())
    }else {
        Err(ValidationError::new("Invalid URL shortner name"))
    }
}

pub async fn create_shorten_url_validation(mut req: Request, next: Next) -> Result<Response, impl IntoResponse>
{
    if req.method() != "POST" {
        return Err("Invalid Method Call")
    }
    // input validation needs to be take place
    Ok(next.run(req).await)
}