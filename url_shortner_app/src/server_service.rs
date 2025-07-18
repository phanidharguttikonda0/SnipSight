use std::sync::Arc;
use tonic::{Request, Response, Status};
use proto_definations_snip_sight::generated::url_shortner::url_shortner_service_server::{UrlShortnerService};
use proto_definations_snip_sight::generated::url_shortner::{CreateShortenUrlPayload, Shorten};
use proto_definations_snip_sight::generated::url_shortner::{CustomName, SuccessMessage, UpdatedCustomName, UrlId, UrlsList, User};
use sqlx::{Pool, Postgres};
use tonic::codegen::http::StatusCode;
use crate::services::shorten_url_write::{delete_url, get_urls, store_new_url, update_shorten_url_name};
// the message payloads are converted to structs, this is why gRPC is any language supporter


#[derive(Debug)]
pub struct UrlShortnerServerServices {
    db: Arc<Pool<Postgres>>
}

impl UrlShortnerServerServices {
    pub fn new(db: Arc<Pool<Postgres>>) -> Self {
        Self { db }
    }
}

#[tonic::async_trait]
impl UrlShortnerService for UrlShortnerServerServices {
    async fn create_shorten_url(&self, request: Request<CreateShortenUrlPayload>) -> Result<Response<Shorten>, Status> {
        tracing::info!("Creating shorten url was going to execute") ;
        let payload = request.into_inner();

        tracing::info!("Received request: {:?}", payload);
        match store_new_url(payload, &self.db).await {
            Ok(result) => {
                tracing::info!("result: {:?}", result);
                Ok(
                    Response::new(
                        Shorten {
                            id: result.1,
                            shorten_url: result.0,
                        }
                    )
                )
            },
            Err(err) => {
                tracing::error!("Error while storing new url: {:?}", err);
                Err(Status::aborted(String::from("Check Whether the url was not same and custom-name to be unique")))
            }
        }

    }

    async fn delete_shorten_url(&self, request: Request<UrlId>) -> Result<Response<SuccessMessage>, Status> {
        tracing::info!("Deleting shorten url was going to execute") ;
        let details = request.into_inner() ;
        tracing::info!("Received request: {:?}", details);
        let result = delete_url(details.id, details.user_id,&self.db).await ;

        match result {
            Ok(_) => {
                tracing::info!("Deleted successfully");
                Ok(Response::new(
                    SuccessMessage {
                        cause: "None".to_string(),
                        operation: true
                    }
                ))
            },
            Err(err) => {
                tracing::error!("Error while deleting url: {:?}", err);
                Err(Status::aborted(err))
            }
        }
    }

    async fn update_shorten_url(&self, request: Request<CustomName>) -> Result<Response<UpdatedCustomName>, Status> {
        tracing::info!("Updating shorten url was going to execute") ;
        let details = request.into_inner() ;
        tracing::info!("Received request: {:?}", details);
        let result = update_shorten_url_name(details.id,&details.custom_name,details.user_id, &self.db).await ;

        match result {
            Ok(_) => {
                tracing::info!("Updated Successfully successfully");
                Ok(Response::new(
                    UpdatedCustomName {
                        cause: "None".to_string(),
                        new_name: details.custom_name
                    }
                ))
            },
            Err(err) => {
                tracing::error!("Error while updating custom name for url: {:?}", err);
                Err(Status::aborted(err))
            }
        }
    }

    async fn get_shorten_urls_list(&self, request: Request<User>) -> Result<Response<UrlsList>, Status> {
        tracing::info!("Getting shorten urls list was going to execute") ;
        let user = request.into_inner();
        tracing::info!("Received request: {:?}", user);
        let urls = get_urls(user.user_id as i32,user.page_number, user.page_size, &self.db).await ;
        match urls {
            Ok(urls) => {
                Ok(Response::new(
                   UrlsList {
                       list: urls
                   }
                ))
            },
            Err(err) => {
                Err(Status::internal(format!("{}", err)))
            }
        }
    }
}

/*
    When we build all these will be generated in to that langauge specific things, so the
    UrlShortnerService is actually the service name in the shortner.proto. Where when we build
    that's get converted to the trait, so we are implementing that trait. and it will also generate
    a Server for that Service. And the remaining payloads we will get directly. That whole .proto file
    will be converted to a module and module name will be service name plus _service_server. inside that
    module we will get the Service trait with the same name and the Server for that service.
*/