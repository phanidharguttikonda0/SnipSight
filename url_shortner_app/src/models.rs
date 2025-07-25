use chrono::NaiveDateTime;
use serde::{Deserialize, Serialize};
use tonic::{Code, Status};

#[derive(sqlx::FromRow)]
pub struct UrlModel {
    pub id: i32,
    pub original_url: String,
    pub shorten_url: String,
    pub view_count: i32,
    pub created_at: NaiveDateTime,
}

#[derive(sqlx::FromRow, Debug)]
pub struct ShortenUrl {
    pub shorten_url: String,
}

#[derive(sqlx::FromRow, Debug)]
pub struct OriginalUrl {
    pub original_url: String,
}

#[derive(Serialize, Debug)]
pub struct DeleteInsight{
    pub message_type: String,
    pub shorten_url: String
}

#[derive(Clone)]
pub struct TopInsights{
    pub unique_views: i32,
    pub top_location: String,
    pub top_browser: String,
    pub top_os: String,
    pub top_device: String,
    pub top_referrer: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct ErrorMessage {
    pub message: String,
    pub status_code: i32,
}

impl ErrorMessage {
    pub fn new(message: String, status_code: i32) -> Self {
        Self {
            message,
            status_code,
        }
    }
}
impl From<ErrorMessage> for Status {
    fn from(err: ErrorMessage) -> Self {
        // Map your custom `status_code` to a `tonic::Code`
        let code = match err.status_code {
            400 => Code::InvalidArgument,
            401 => Code::Unauthenticated,
            403 => Code::PermissionDenied,
            404 => Code::NotFound,
            409 => Code::AlreadyExists,
            500 => Code::Internal,
            _ => Code::Unknown,
        };

        Status::new(code, err.message)
    }
}

