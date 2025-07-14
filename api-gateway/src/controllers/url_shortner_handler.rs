use axum::{Extension, Form};
use axum::extract::Path;
use axum::response::IntoResponse;
use proto_definitions_snip_sight::generated::url_shortner::CreateShortenUrlPayload;
use proto_definitions_snip_sight::generated::url_shortner::url_shortner_service_client::UrlShortnerServiceClient;
use serde_json::json;
use crate::models::authentication_models::Claims;
use crate::models::url_shorten_models::UrlShortenModel;

pub async fn create_shorten_url(Extension(claims): Extension<Claims>, Form(data):Form<UrlShortenModel>) -> impl IntoResponse {

    // connecting to create_shorten url gRPC server
    let mut client = UrlShortnerServiceClient::connect("http://localhost:9091").await;
    let name = data.custom_url.unwrap_or_else(|| String::from("we need to generate a custom url"));
    match client {
        Ok(mut client_channel) => {
            // Creating a Request
            let request = tonic::Request::new( CreateShortenUrlPayload{
                user_id: claims.user_id as i64,
                custom_url: name,
                original_url: data.original_url,
            }) ;
            // sending the request
            let response = client_channel.create_shorten_url(request).await ;
            tracing::info!("Response from gRPC server: {:?}", response);
            // we are going to handle the response as well
        },
        Err(error) => {
            tracing::error!("Error in connecting to gRPC server: {}", error);
            // we are going to return error with status code 500
        }
    }

}

pub async fn get_urls(Extension(claims): Extension<Claims>) -> impl IntoResponse {

}

// for the path we are going to do the input validation inside before sending the request
pub async fn delete_url(Path(id): Path<i64>,Extension(claims): Extension<Claims>) -> impl IntoResponse {
    "checks will be done in the url_shortner service"
}

pub async fn update_url(Path((id, new_name)): Path<(i64, String)>,Extension(claims): Extension<Claims>) -> impl IntoResponse {
    "Json(format!())"
}
