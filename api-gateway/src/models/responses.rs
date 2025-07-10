use serde::Serialize;

#[derive(Serialize)]
pub struct SuccessResponse<T> {
    pub body: T,
}

#[derive(Serialize)]
pub struct ErrorResponse {
    pub message: String,
}