use chrono::NaiveDateTime;

#[derive(sqlx::FromRow)]
pub struct UrlModel {
    pub id: i64,
    pub original_url: String,
    pub short_url: String,
    pub view_count: i64,
    pub created_at: NaiveDateTime,
}