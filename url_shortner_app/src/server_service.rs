use tonic::{Request, Response, Status};
use shortner::url_shortner_service_server::{UrlShortnerService};
use shortner::{CreateShortenUrlPayload, Shorten}; // the message payloads are converted to structs, this is why gRPC is any language supporter

pub mod shortner {
    tonic::include_proto!("url_shortner");
}

#[derive(Debug, Default)]
pub struct UrlShortnerServer {}

#[tonic::async_trait]
impl UrlShortnerService for UrlShortnerServer{
    async fn create_shorten_url(&self, request: Request<CreateShortenUrlPayload>) -> Result<Response<Shorten>, Status> {
        let payload = request.into_inner();

        let reply = Shorten {
            shorten_url: payload.custom_url,
        };

        Ok(Response::new(reply))
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