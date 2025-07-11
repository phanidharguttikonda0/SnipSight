use axum::body::Body;
use axum::response::IntoResponse;
use reqwest::Response;

pub async fn response_creator(reqwest_response: Response) -> impl IntoResponse {
    let status_code = reqwest_response.status();
    let headers = reqwest_response.headers().clone();
    let body = reqwest_response.text().await.unwrap();


    let mut response = axum::response::Response::builder().status(status_code)
        .body(Body::from(body)).unwrap() ;
    for (key, value) in headers.iter() {
        response.headers_mut().insert(key.clone(), value.clone());
    }
    response.into_response()
}