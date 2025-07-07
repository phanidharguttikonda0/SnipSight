mod middlewares;
mod handlers;

use axum::{Router};
use axum::routing::{post, get};
use sqlx::{PgPool, Pool, Postgres};
use tracing_subscriber;
use crate::handlers::{sign_in_handler, sign_up_handler};

#[derive(Clone)]
pub struct AppState {
    pub db_pool: PgPool,
    pub jwt_secret: String,
}

impl AppState {
    pub fn new(db_pool: PgPool, jwt_secret: String) -> Self {
        AppState {
            db_pool, jwt_secret
        }
    }
}

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt::init();
    // input validation is done in the api-gateway itself


    tracing::info!("going to create rds database connection");
    if let Some(rds_connection) = create_connection(get_rds_url().await).await
    {
        let jwt_secret = get_jwt_key().await ;
        let app = Router::new()
            .route("/", get(|| async {
                "Just a Test whether Server working properly or not"
            }))
            .route("/sign-in/{username}/{password}", post(sign_in_handler))
            .route("/sign-up/{username}/{password}/{mail_id}/{mobile}/{country_id}", post(sign_up_handler))
            .with_state(AppState::new(rds_connection, jwt_secret))
            ;



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
    String::from("")
}

async fn get_jwt_key() -> String {
    String::from("") // jwt secrets key
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