use axum::{middleware::Next, extract::Request, response::Response};
use axum::body::{to_bytes, Body};
use axum::response::IntoResponse;
use regex::Regex;
use validator::{Validate, ValidationError};
use crate::models::url_shorten_models::{Insight, UrlShortenModel};
use std::net::SocketAddr;
use axum::extract::State;
use crate::AppState;

pub fn validate_url_shortner_name(input: &str) -> Result<(), ValidationError> {
    let allowed_chars = Regex::new(r"^[a-zA-Z0-9_-]{5,}$").unwrap();

    let result = allowed_chars.is_match(input) && !input.ends_with('-') ;
    if result {
        Ok(())
    } else {
        Err(ValidationError::new("Invalid Shorten Url Name"))
    }
}


pub async fn shorten_url_validation(req: Request, next: Next) -> Result<Response, impl IntoResponse>
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

pub async fn redirection_data_gathering(State(state): State<AppState>,req: Request, next: Next) -> Result<Response, impl IntoResponse> {
    // here itself we are going to get all the required fields like ip address reffereal source and all
    let (parts, body) = req.into_parts();



    let headers = &parts.headers;
    let ip_address = if let Some(ip) = headers.get("x-forwarded-for").and_then(|h| h.to_str().ok()) {
        ip.to_string()
    }else if let Some(addr) = parts.extensions.get::<SocketAddr>() {
        addr.ip().to_string()
    }else {
        "unknown".to_string()
    };
    tracing::info!("IP Address: {}", ip_address);
    let referrer = headers.get("referer").and_then(|h| h.to_str().ok()).unwrap_or("Direct").to_string();
    tracing::info!("Referrer: {}", referrer);
    let user_agent_header = headers .get(axum::http::header::USER_AGENT)
        .and_then(|value| value.to_str().ok());

    if let Some(ua_str) = user_agent_header {
        // Parse the User-Agent string using the 'user-agent' crate
        let user_agent = state.user_agent;

        let browser = user_agent.parse_product(ua_str).name
            .map(|cow_name| cow_name.to_string()) // Convert Cow to String if Some
            .unwrap_or_else(|| "Unknown Browser".to_string());

        let os = user_agent.parse_os(ua_str).name
            .map(|cow_name| cow_name.to_string())
            .unwrap_or_else(|| "Unknown OS".to_string());

        let device_name = user_agent.parse_device(ua_str).name
            .map(|cow_name| cow_name.to_string())
            .unwrap_or_else(|| "Unknown Device".to_string());

        // Extract and print the desired information
        tracing::info!("--- User-Agent Details ---");
        tracing::info!("Raw User-Agent: {}", ua_str);
        tracing::info!("Browser: {:?}", browser);
        tracing::info!("OS: {:?}", os);
        tracing::info!("Device: {:?}", device_name);
        tracing::info!("--------------------------");
        tracing::info!("IP: {}", ip_address);
        tracing::info!("Referrer: {}", referrer);

        // Rebuild the request and forward it
        let mut req = Request::from_parts(parts, body);
        req.extensions_mut().insert(Insight::new(ip_address,referrer,device_name,browser,os));
        Ok(next.run(req).await)

    } else {
        tracing::warn!("User-Agent header not found in request.");
        Err(Response::builder().status(400).body(Body::from("Invalid User Agent")).unwrap())
    }

}