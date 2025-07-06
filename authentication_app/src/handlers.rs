use axum::extract::Path;
use axum::{Form, Json};
use axum::http::StatusCode;
use axum::response::IntoResponse;
use serde::{Serialize, Deserialize};
use crate::middlewares::create_authorization_header;

#[derive(Serialize)]
pub struct Header {
    header: String,
}
#[derive(Serialize)]
pub struct ErrorResponse{
    error: String,
}

pub async fn sign_in_handler(Path((username, password)): Path<(String, String)>)
                             -> Result<impl IntoResponse, impl IntoResponse>
{
    if username.is_empty() || password.is_empty() {
        return Err((
            StatusCode::BAD_REQUEST,
            Json(ErrorResponse {
                error: "Username or password cannot be empty".to_string(),
            }),
        ));
    }
    // here we call the service that access the database
    let header = create_authorization_header(1, username).await;

    Ok((
        StatusCode::OK,
        Json(Header { header })
    ))
}


pub async fn sign_up_handler(Path((username, password, mail_id, mobile)): Path<(String, String, String, String)>)
                             -> Result<impl IntoResponse, impl IntoResponse>
{
    if username.is_empty() || password.is_empty() || mail_id.is_empty() || mobile.is_empty() {
        return Err((
            StatusCode::BAD_REQUEST,
            Json(ErrorResponse {
                error: "Username and password are required".to_string(),
            }),
        ));
    }
    // here we call the service that access the database 
    let header = create_authorization_header(1, username).await;

    Ok((
        StatusCode::OK,
        Json(Header { header })
    ))
}
