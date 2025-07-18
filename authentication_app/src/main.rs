mod middlewares;
mod handlers;
mod state;
use sqlx::{PgPool, Pool, Postgres};
use tracing_subscriber;
use authentication_app::create_app;



#[tokio::main]
async fn main() {
    tracing_subscriber::fmt::init();
    // input validation is done in the api-gateway itself

    tracing::info!("going to create rds database connection");
    if let Some(rds_connection) = create_connection(get_rds_url().await).await
    {
        let jwt_secret = get_jwt_key().await ;
        let app = create_app(rds_connection, jwt_secret);

        let tcp_listener = tokio::net::TcpListener::bind("0.0.0.0:9090").await.unwrap();
        tracing::info!("Listening on {}", tcp_listener.local_addr().unwrap());
        axum::serve(tcp_listener, app).await.unwrap()
    }else{
        tracing::error!("Could not create rds database connection");
        tracing::error!("So the database connection could not be created");
    }
}


async fn get_rds_url() -> String {
    // here we need to get the urls from the aws secret manager or what ever we use
    tracing::info!("going to get rds url");
    String::from("postgres://postgres:Phani9090Kl@snipshare.cbigqkgesirb.ap-south-1.rds.amazonaws.com:5432/authentication_app")
    // String::from("postgres://postgres:phani@localhost:5432/authentication_app") // -- for local testing
}

async fn get_jwt_key() -> String {
    String::from("secret") // jwt secrets key
}

async fn create_connection(connection_url: String) -> Option<Pool<Postgres>> {
    let pool = PgPool::connect(&connection_url).await ;
    match pool {
        Ok(pool) => Some(pool),
        Err(error) => {
            tracing::error!("{}", error);
            None
        }
    }
}