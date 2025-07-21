use chrono::NaiveDateTime;
use serde::Serialize;

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