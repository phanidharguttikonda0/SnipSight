use std::sync::Arc;
use tonic::{Request, Response, Status};
use proto_definations_snip_sight::generated::url_shortner::url_shortner_service_server::{UrlShortnerService};
use proto_definations_snip_sight::generated::url_shortner::{CreateShortenUrlPayload, GetInsights, KeyInsights, Shorten, Url};
use proto_definations_snip_sight::generated::url_shortner::{SuccessMessage, UrlId, UrlsList, User};
use sqlx::{Pool, Postgres};
use crate::services::dynamo_db_operations::{get_insights, delete_insights};
use crate::services::shorten_url_write::{delete_url, get_original_url_service, get_urls, increase_view_count, store_new_url, update_shorten_url_name};
// the message payloads are converted to structs, this is why gRPC is any language supporter
use aws_sdk_dynamodb::Client as DynamoClient;

#[derive(Debug)]
pub struct UrlShortnerServerServices {
    db: Arc<Pool<Postgres>>,
    client: Arc<DynamoClient>
}

impl UrlShortnerServerServices {
    pub fn new(db: Arc<Pool<Postgres>>, client: Arc<DynamoClient>) -> Self {
        Self { db, client }
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
                Err(Status::aborted(err))
            }
        }

    }

    async fn delete_shorten_url(&self, request: Request<UrlId>) -> Result<Response<SuccessMessage>, Status> {
        tracing::info!("Deleting shorten url was going to execute") ;
        let details = request.into_inner() ;
        tracing::info!("Received request: {:?}", details);
        let result = delete_url(details.id, details.user_id,&self.db).await ;

        match result {
            Ok(shorten_url) => {
                tracing::info!("Deleted successfully");
                // here we are going to delete the delete Operations in the dynamo db

                match delete_insights(shorten_url).await {
                    Ok(message_id) => {
                        tracing::info!("Deleted successfully from Dynamo Db as well here is message id {}", message_id);
                    },
                    Err(err) => {
                        tracing::error!("Error while deleting insights: {:?}", err);
                    }
                }

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

    async fn increment_count(&self, request: Request<Url>) -> Result<Response<SuccessMessage>, Status> {
        tracing::info!("Incrementing count was going to execute") ;
        let url = request.into_inner();
        tracing::info!("Received request: {:?}", url);
        let result = increase_view_count(&url.url, &self.db).await ;
        match result {
            Ok(res) => {
                tracing::info!("Count incremented successfully");
                Ok(Response::new(
                    SuccessMessage {
                        cause: "None".to_string(),
                        operation: res
                    }
                ))
            },
            Err(err) => {
                tracing::error!("Error while incrementing count: {:?}", err);
                Err(Status::aborted(err))
            }
        }
    }

    async fn get_original_url(&self, request: Request<Url>) -> Result<Response<Url>, Status> {
        tracing::info!("get_original_url was going to execute") ;
        let url = request.into_inner();
        tracing::info!("Received request: {:?}", url);
        let result = get_original_url_service(&url.url, &self.db).await ;

        match result {
            Ok(res) => {
                tracing::info!("Successfully got original url");
                Ok(Response::new(
                    Url {
                        url: res
                    }
                ))
            },
            Err(err) => {
                tracing::error!("Error while getting original url: {:?}", err);
                Err(Status::aborted(err))
            }
        }
    }

    async fn get_key_insights(&self, request: Request<GetInsights>) -> Result<Response<KeyInsights>, Status> {
        // we are going to get the data
        tracing::info!("get_key_insights was going to execute") ;
        let insights_request = request.into_inner() ;
        match get_insights(insights_request, &self.client).await {
            Ok(result) => {
                tracing::info!("Got the  Insights for the shorten url {}", result.shorten_url);
                Ok(Response::new(result))
            },
            Err(err) => {
                tracing::error!("Error while getting insights: {:?}", err);
                Err(Status::aborted(err))
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