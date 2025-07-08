use sqlx::PgPool;

#[derive(Clone)]
pub struct AppState {
    pub db_pool: PgPool,
    pub jwt_secret: String,
}

impl AppState {
    pub fn new(db_pool: PgPool, jwt_secret: String) -> Self {
        AppState {
            db_pool, jwt_secret
        }
    }
}