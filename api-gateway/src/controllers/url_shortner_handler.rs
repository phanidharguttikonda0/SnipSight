use axum::{Extension, Form, Json};
use axum::extract::{Path, Query};
use axum::response::IntoResponse;
use hyper::StatusCode;
use proto_definations_snip_sight::generated::url_shortner::{CreateShortenUrlPayload, User};
use proto_definations_snip_sight::generated::url_shortner::url_shortner_service_client::UrlShortnerServiceClient;
use crate::models::authentication_models::Claims;
use crate::models::responses::ErrorResponse;
use crate::models::url_shorten_models::{PaginationParams, UrlShortenModel};

pub async fn create_shorten_url(Extension(claims): Extension<Claims>, Form(data):Form<UrlShortenModel>) -> Result<impl IntoResponse, (StatusCode, Json<ErrorResponse>)> {

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
            match response {
                Ok(response) => {
                    tracing::info!("Response from gRPC server: {:?}", response);
                    Ok(
                        (
                            StatusCode::CREATED,
                            serde_json::to_string(&response.into_inner()).unwrap() // we are passing the shorten url and it's id
                        )
                    )
                },
                Err(status) => {
                    tracing::info!("Error in gRPC server response: {}", status);
                    Err((
                        StatusCode::CONFLICT, // the data was conflicting with the database
                       Json( ErrorResponse {
                            message: "Error in connecting to gRPC server".to_string(),
                        })
                    ))
                }
            }
        },
        Err(error) => {
            tracing::error!("Error in connecting to gRPC server: {}", error);
            // we are going to return error with status code 500
            Err((
                    StatusCode::INTERNAL_SERVER_ERROR,
                    Json(
                        ErrorResponse {
                            message: "Error in connecting to gRPC server".to_string(),
                        }
                    )
                ))
        }
    }

}

pub async fn get_urls(Query(params): Query<PaginationParams>,Extension(claims): Extension<Claims>) -> impl IntoResponse {
    tracing::info!("get urls request recieved to the gate_way ") ;
    let mut client = UrlShortnerServiceClient::connect("http://localhost:9091").await;

    match client {
        Ok(mut client_channel) => {
            let request = tonic::Request::new(
                User {
                    page_size: params.page_size.unwrap_or(5),
                    page_number: params.page_number.unwrap_or(1),
                    user_id: claims.user_id as i64,
                }
            );

            let response = client_channel.get_shorten_urls_list(request).await;
            // we need to handle the response
        },
        Err(status) => {
            tracing::error!("unable to connect to gate_way server: {}", status);
            // we need to return internal server error
        }
    }
}

// for the path we are going to do the input validation inside before sending the request
pub async fn delete_url(Path(id): Path<i64>,Extension(claims): Extension<Claims>) -> impl IntoResponse {
    "checks will be done in the url_shortner service"
}

pub async fn update_url(Path((id, new_name)): Path<(i64, String)>,Extension(claims): Extension<Claims>) -> impl IntoResponse {
    "Json(format!())"
}
