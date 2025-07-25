use axum::Form;
use axum::http::HeaderValue;
use axum::response::IntoResponse;
use hyper::StatusCode;
use reqwest::Client;
use crate::models::authentication_models::{Login, Register};
use crate::middlewares::response_creator::response_creator;
pub async fn sign_in(Form(login) :Form<Login>) -> Result<impl IntoResponse, impl IntoResponse> {
    let client = Client::new() ; // authentication-container
    match client.get(format!("http://authentication-container:9090/sign-in/{}/{}",login.username,login.password)).send().await {
        Ok(mut response) => {
            tracing::info!("Got the Response from the authentication server") ;
            tracing::info!("Now going to rebuild the response compatible with the AXUM IntoResponse") ;

            tracing::info!("Now returning the response to the client") ;
            tracing::info!("Authorization header was  : {:?}", response.headers().get("Authorization").unwrap()) ;

            Ok(response_creator(response).await)
        },
        Err(error) => {
            tracing::error!(" ---> Error was : {}", error);
            tracing::error!("Where the error was occurred because of not able to get the response from the authentication server ");
            Err((
                StatusCode::INTERNAL_SERVER_ERROR,
                "Internal Server Error"
                ))
        }
    }
}

pub async fn sign_up(Form(register) :Form<Register>) -> impl IntoResponse{
    let client = Client::new() ;
    match client.get(format!("http://authentication-container:9090/sign-up/{}/{}/{}/{}/{}",
    register.username, register.password, register.mail_id, register.mobile, register.country_id)).send().await{
        Ok(response) => {
            tracing::info!("Got the Response from the authentication server") ;
            tracing::info!("Now going to rebuild the response compatible with the AXUM IntoResponse") ;

            tracing::info!("Now returning the response to the client") ;
            Ok(response_creator(response).await)
        },
        Err(error) => {
            tracing::error!(" ---> Error was : {}", error);
            tracing::error!("Where the error was occurred because of not able to get the response from the authentication server ");
            Err((
                StatusCode::INTERNAL_SERVER_ERROR,
                "Internal Server Error"
            ))
        }
    }
}