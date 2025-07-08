use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize, Serialize)]
pub struct Claims{
    pub user_id: i32,
    pub username: String,
    pub exp: usize,
}