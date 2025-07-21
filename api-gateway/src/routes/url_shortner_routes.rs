use axum::{middleware, Router};
use axum::routing::{post, get};
use crate::controllers::url_shortner_handler::{create_shorten_url, delete_url, get_key_insights, get_urls};
use crate::middlewares::url_shortner_middlewares::{shorten_url_validation};

pub fn url_shortner_routes() -> Router {

    Router::new()
        .route("/create-url", post(create_shorten_url).layer(middleware::from_fn(shorten_url_validation)))
        .route("/get-urls", get(get_urls))
        .route("/delete-url/{id}", get(delete_url))
        .route("/key-insights/{shorten_url}/{page_size}/{last_evaluated_key}", get(get_key_insights))
}
/*
from_fn_with_state, the middleware first parameter to be State(value) : State<T>
*/