use axum::{Extension, Form, Json};
use axum::extract::{Path, Query};
use axum::response::IntoResponse;
use hyper::StatusCode;
use proto_definations_snip_sight::generated::url_shortner::{CreateShortenUrlPayload, CustomName, UrlId, User, Url};
use proto_definations_snip_sight::generated::url_shortner::url_shortner_service_client::UrlShortnerServiceClient;
use tonic::transport::{Channel, Error};
use crate::models::authentication_models::Claims;
use crate::models::responses::ErrorResponse;
use crate::models::url_shorten_models::{KeyInsights, PaginationParams, UrlShortenModel};

async fn create_grpc_connection() -> Result<UrlShortnerServiceClient<Channel>, Error> {
    UrlShortnerServiceClient::connect("http://url-shortner-container:9091").await
}

pub async fn create_shorten_url(Extension(claims): Extension<Claims>, Form(data):Form<UrlShortenModel>) -> Result<impl IntoResponse, (StatusCode, Json<ErrorResponse>)> {

    // connecting to create_shorten url gRPC server
    let mut client = create_grpc_connection().await;
    // generation of custom-url
    let name = data.custom_url.unwrap_or_else(|| String::from("we need to generate a custom url"));
    tracing::info!("create shorten url request recieved to the gate_way ") ;
    match client {
        Ok(mut client_channel) => {
            // Creating a Request
            let request = tonic::Request::new( CreateShortenUrlPayload{
                user_id: claims.user_id,
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
    let mut client =  create_grpc_connection().await;
    tracing::info!("Params Recieved was {:?}", params) ;
    tracing::info!("page_number {} and page _size {}", params.page_number.unwrap_or(1), params.page_size.unwrap_or(5)) ;
    match client {
        Ok(mut client_channel) => {
            let request = tonic::Request::new(
                User {
                    page_size: params.page_size.unwrap_or(5),
                    page_number: params.page_number.unwrap_or(1),
                    user_id: claims.user_id,
                }
            );

            let response = client_channel.get_shorten_urls_list(request).await;
            // we need to handle the response
            match response {
                Ok(response) => {
                    tracing::info!("Response from gRPC server: {:?}", response);
                    Ok(
                        (
                            StatusCode::OK,
                            serde_json::to_string(&response.into_inner()).unwrap()
                        )
                    )
                },
                Err(status) => {
                    tracing::error!("Error in gRPC server response: {}", status);
                    Err((
                        StatusCode::INTERNAL_SERVER_ERROR,
                        Json(
                            ErrorResponse {
                                message: "Error in getting response from gRPC".to_string(),
                            }
                        )
                    ))
                }
            }
        },
        Err(status) => {
            tracing::error!("unable to connect to gRPc : {}", status);
            // we need to return internal server error
            Err((
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(
                    ErrorResponse {
                        message: "Error in getting response from gRPC".to_string(),
                    }
                )
            ))
        }
    }
}

// for the path we are going to do the input validation inside before sending the request
pub async fn delete_url(Path(id): Path<i32>,Extension(claims): Extension<Claims>) -> impl IntoResponse {
   tracing::info!("delete url request recieved to the gate_way ") ;
    let client =  create_grpc_connection().await;
    match client {
        Ok(mut client) => {
           let request = tonic::Request::new(
               UrlId {
                   user_id: claims.user_id,
                   id
               }
           ) ;

           let response = client.delete_shorten_url(request).await ;

            match response {
                Ok(response) => {
                    tracing::info!("Response from gRPC server: {:?}", response);
                    Ok(
                        (
                            StatusCode::NO_CONTENT,
                            serde_json::to_string(&response.into_inner()).unwrap()
                        )
                    )
                },
                Err(status) => {
                    tracing::error!("Error in gRPC server response: {}", status);
                    Err((
                        StatusCode::BAD_REQUEST,
                        Json(
                            ErrorResponse {
                                message: status.message().to_string(),
                            }
                        )
                    ))
                }
            }
        },
        Err(err) => {
            tracing::error!("unable to connect to gRPC : {}", err);
            Err((
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(
                    ErrorResponse {
                        message: "Error in getting response from gRPC".to_string(),
                    }
                )
            ))
        }
    }
}

pub async fn update_url(Path((id, new_name)): Path<(i32, String)>,Extension(claims): Extension<Claims>) -> impl IntoResponse {

    tracing::info!("update url request recieved to the gate_way ") ;
    let client = create_grpc_connection().await;

    match client {
        Ok(mut client) => {

            let request = tonic::Request::new(
                CustomName {
                    user_id: claims.user_id,
                    custom_name: new_name,
                    id
                }
            ) ;

            let response = client.update_shorten_url(request).await ;
            match response {
                Ok(response) => {
                    tracing::info!("Response from gRPC server: {:?}", response);
                    Ok(
                        (
                            StatusCode::OK,
                            serde_json::to_string(&response.into_inner()).unwrap()
                        )
                    )
                }
                Err(error) =>{
                    tracing::error!("Error in gRPC server response: {}", error);
                    Err((
                        StatusCode::BAD_REQUEST,
                        Json(
                            ErrorResponse {
                                message: error.message().to_string(),
                            }
                        )
                    ))
                }
            }


        },
        Err(err) => {
            tracing::error!("unable to connect to gRPC : {}", err);
            Err((
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(
                    ErrorResponse {
                        message: "Error in Connecting to gRPC".to_string(),
                    }
                )
            ))
        }
    }
}



pub async fn redirect_url(Path(shorten_url): Path<String>) -> impl IntoResponse {
    tracing::info!("redirect url request recieved to the gate_way ") ;

    let client = create_grpc_connection().await;

    match client {
        Ok(mut client) => {
            let request = tonic::Request::new(
                    Url {
                        url: shorten_url.clone(),
                    }
            ) ;

            let response = client.get_original_url(request).await ;
            match response {
                Ok(response) => {
                    tracing::info!("Response from gRPC server: {:?}", response);

                    // Now we are going to store the count
                    let request = tonic::Request::new(
                        Url {
                            url: shorten_url,
                        }
                    ) ;

                    let response1 = client.increment_count(request).await ;

                    match response1 {
                        Ok(response1) => {
                            if response1.into_inner().operation {
                                tracing::info!("count incremented successfully") ;
                                axum::response::Redirect::temporary(&response.into_inner().url).into_response()
                            }else{
                                StatusCode::NOT_FOUND.into_response()
                            }
                        }
                        Err(error) =>{
                            StatusCode::INTERNAL_SERVER_ERROR.into_response()
                        }
                    }


                },
                Err(error) =>{
                    tracing::error!("Error in gRPC server response: {}", error);
                    StatusCode::NOT_FOUND.into_response()
                }
            }

        },
        Err(err) => {
            tracing::error!("unable to connect to gRPC : {}", err);
            StatusCode::INTERNAL_SERVER_ERROR.into_response()
        }
    }
}


pub async fn get_key_insights(Path(id):Path<i32>, Query(params):Query<PaginationParams>, Extension(claims):Extension<Claims>) -> Result<impl IntoResponse,impl IntoResponse> {

    if params.page_number.is_some() || params.page_size.is_some() {
        return Err(
            (
                StatusCode::BAD_REQUEST,
                Json(
                    ErrorResponse {
                        message: "Page number and page size are not allowed".to_string(),
                    }
                )
                )
        )
    }
    Ok(
        (
            StatusCode::OK,
            Json(
                    KeyInsights {
                        insights: vec![]
                    }
            )
        )
    )
}
