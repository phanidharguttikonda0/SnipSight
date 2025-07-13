mod server_service;
use server_service::shortner::url_shortner_service_server::UrlShortnerServiceServer;
use server_service::UrlShortnerServer;


use tonic::{Request, Response, Status};
use tonic::transport::Server;

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
