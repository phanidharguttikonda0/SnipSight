use serde::{Deserialize, Serialize};

#[derive(Serialize)]
pub struct SuccessResponse<T> {
    pub body: T,
}

#[derive(Serialize, Deserialize)]
pub struct ErrorResponse {
    pub message: String,
}