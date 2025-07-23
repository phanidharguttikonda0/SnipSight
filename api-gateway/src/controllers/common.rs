use axum::http::StatusCode;
use tonic::Code;

pub async fn get_status(code:Code) -> StatusCode {
    match code {
        tonic::Code::NotFound => StatusCode::NOT_FOUND,
        tonic::Code::AlreadyExists => StatusCode::CONFLICT,
        tonic::Code::InvalidArgument => StatusCode::BAD_REQUEST,
        tonic::Code::PermissionDenied => StatusCode::FORBIDDEN,
        tonic::Code::Unauthenticated => StatusCode::UNAUTHORIZED,
        tonic::Code::Internal => StatusCode::INTERNAL_SERVER_ERROR,
        _ => StatusCode::INTERNAL_SERVER_ERROR,
    }
}