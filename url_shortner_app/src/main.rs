mod server_service;
mod services;
mod models;

use std::sync::Arc;
use proto_definations_snip_sight::generated::url_shortner::url_shortner_service_server::UrlShortnerServiceServer;
use sqlx::PgPool;
use server_service::UrlShortnerServerServices;
use tonic::transport::Server;




#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let address = "127.0.0.1:9091".parse()?;
    let pool = PgPool::connect("postgres://user:pass@localhost/db").await?;
    let service = UrlShortnerServerServices::new(Arc::new(pool));

    println!("Listening on {}", address);

    Server::builder()
        .add_service(UrlShortnerServiceServer::new(service))
        .serve(address).await.unwrap();

    Ok(())
}


async fn get_database_connection_urls() -> (String, String) {
    (String::from("Postgres-SQL"), String::from("Dynamo-DB"))
}

async fn create_database_connections() {
    let (postgres_url, dynamo_url) = get_database_connection_urls().await;
    println!(
        "Postgres-SQL: {} \n Dynamo-DB: {}",
        postgres_url, dynamo_url
    );
}