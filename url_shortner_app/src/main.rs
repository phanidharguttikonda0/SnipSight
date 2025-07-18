mod server_service;
mod services;
mod models;

use std::sync::Arc;
use aws_config::meta::region::RegionProviderChain;
use aws_sdk_ssm::Client;
use proto_definations_snip_sight::generated::url_shortner::url_shortner_service_server::UrlShortnerServiceServer;
use sqlx::{PgPool, Pool, Postgres};
use server_service::UrlShortnerServerServices;
use tonic::transport::Server;




#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    tracing::info!("Starting gRPC server");
    tracing_subscriber::fmt::init();
    // when we are running as a docker container on the cloud we need to update it to "[::1]:9091".parse()?
    let address = "0.0.0.0:9091".parse()?;
    // let pool = PgPool::connect("postgres://postgres:phani@localhost:5432/url_shortner_service").await?; -- locally
    let pool = create_database_connections().await;
    let service = UrlShortnerServerServices::new(Arc::new(pool));

    println!("Listening on {}", address);

    Server::builder()
        .add_service(UrlShortnerServiceServer::new(service))
        .serve(address).await.unwrap();

    Ok(())
}


async fn get_database_connection_urls() -> (String, String) {

    let region_provider = RegionProviderChain::default_provider().or_else("ap-south-1");
    let config = aws_config::from_env().region(region_provider).load().await;

    // Create the SSM client
    let client = Client::new(&config);

    // Define your parameter name
    let param_name = "/snipsight/db/rds";
    let param_name_dynamodb = "/snipsight/db/dynamodb";

    // Fetch the parameter with decryption enabled
    let result1 = client
        .get_parameter()
        .name(param_name)
        .with_decryption(true)
        .send()
        .await.unwrap();

    // let result2 =  client
    //     .get_parameter()
    //     .name(param_name_dynamodb)
    //     .with_decryption(true)
    //     .send()
    //     .await.unwrap();

    let mut postgres_url = String::from("Postgres-SQL") ;
    // let mut dynamo_url = String::from("Dynamo-DB") ;

    if let Some(value) = result1.parameter.and_then(|p| p.value) {
        tracing::info!("Found URL for postgres from SSM Parameter Store {}", value);
        postgres_url = value;
    }else {
        tracing::error!("No URL found for postgres from SSM Parameter Store");
        postgres_url = String::from("No value found");
    }

    // if let Some(value) = result2.parameter.and_then(|p| p.value) {
    //     tracing::info!("Found URL for dynamo db from SSM Parameter Store {}", value);
    //     dynamo_url = value;
    // }else {
    //     tracing::error!("No URL found for dynamo from SSM Parameter Store");
    //     dynamo_url = String::from("No value found");
    // }

    (format!("postgres_url{}", "url_shortner_app"), String::from("dynamo_url"))
}

async fn create_database_connections() -> Pool<Postgres>{
    let (postgres_url, dynamo_url) = get_database_connection_urls().await;
    println!(
        "Postgres-SQL: {} \n Dynamo-DB: {}",
        postgres_url, dynamo_url
    );

    PgPool::connect(&postgres_url).await.unwrap()
}