use chrono::NaiveDateTime;

#[derive(sqlx::FromRow)]
pub struct UrlModel {
    pub id: i32,
    pub original_url: String,
    pub shorten_url: String,
    pub view_count: i32,
    pub created_at: NaiveDateTime,
}

#[derive(sqlx::FromRow, Debug)]
pub struct OriginalUrlModel {
    pub original_url: String,
}