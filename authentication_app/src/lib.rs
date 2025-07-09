/*

✅ Why It's Recommended for Integration Testing
Rust's tests/ directory creates independent test crates.

So if your function (e.g., create_app()) only exists in main.rs, the compiler won’t allow you to import
it in tests/integration_test.rs.

That's because main.rs builds a binary, not a library. Binaries cannot be imported.

🔥 But if you define that function in lib.rs, and then call it from main.rs, you can also import it
from your tests!

*/

mod handlers;
pub mod middlewares;
use axum::Router;
use axum::routing::{get, post};
use sqlx::{PgPool, Pool, Postgres};
use handlers::*;
mod state;
use state::AppState;

pub fn create_app(rds_connection: Pool<Postgres>, jwt_secret: String) -> Router {
    Router::new()
        .route("/", get(|| async {
            "Just a Test whether Server working properly or not"
        }))
        .route("/sign-in/{username}/{password}", get(sign_in_handler))
        .route("/sign-up/{username}/{password}/{mail_id}/{mobile}/{country_id}", get(sign_up_handler))
        .route("/get-countries", get(get_countries_handler))
        .with_state(AppState::new(rds_connection, jwt_secret))
}

