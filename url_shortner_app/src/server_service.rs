use std::sync::Arc;
use tonic::{Request, Response, Status};
use proto_definations_snip_sight::generated::url_shortner::url_shortner_service_server::{UrlShortnerService};
use proto_definations_snip_sight::generated::url_shortner::{CreateShortenUrlPayload, Shorten};
use proto_definations_snip_sight::generated::url_shortner::{CustomName, SuccessMessage, UpdatedCustomName, UrlId, UrlsList, User};
use sqlx::{Pool, Postgres};
use tonic::codegen::http::StatusCode;
use crate::services::shorten_url_write::store_new_url;
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
        todo!()
    }

    async fn update_shorten_url(&self, request: Request<CustomName>) -> Result<Response<UpdatedCustomName>, Status> {
        todo!()
    }

    async fn get_shorten_urls_list(&self, request: Request<User>) -> Result<Response<UrlsList>, Status> {
        todo!()
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