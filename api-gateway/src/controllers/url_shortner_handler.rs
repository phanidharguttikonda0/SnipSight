use axum::{Extension, Form};
use axum::extract::Path;
use axum::response::IntoResponse;
use serde_json::json;
use crate::models::authentication_models::Claims;
use crate::models::url_shorten_models::UrlShortenModel;

pub async fn create_shorten_url(Extension(claims): Extension<Claims>, Form(data):Form<UrlShortenModel>) -> impl IntoResponse {
    // ✅ On success
    // extension to be first than form data
    axum::Json(json!({
        "status": "success",
        "message": "URL shortened successfully",
        "original_url": data.original_url,
        "custom_url": data.custom_url,
        "user": claims.user_id,
    }))
}

pub async fn get_urls(Extension(claims): Extension<Claims>) -> impl IntoResponse {

}

// for the path we are going to do the input validation inside before sending the request
pub async fn delete_url(Path(id): Path<i64>,Extension(claims): Extension<Claims>) -> impl IntoResponse {
    "checks will be done in the url_shortner service"
}

pub async fn update_url(Path((id, new_name)): Path<(i64, String)>,Extension(claims): Extension<Claims>) -> impl IntoResponse {
    "Json(format!())"
}
