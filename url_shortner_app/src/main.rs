
use tonic::{Request, Response, Status};
use tonic::transport::Server;
use shortner::url_shortner_service_server::{UrlShortnerService, UrlShortnerServiceServer};
use shortner::{CreateShortenUrlPayload, Shorten};

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

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let address = "127.0.0.1:9091".parse()?;
    let service = UrlShortnerServer::default();

    println!("Listening on {}", address);

    Server::builder()
        .add_service(UrlShortnerServiceServer::new(service))
        .serve(address).await.unwrap();

    Ok(())
}
