use axum::{middleware, Router};
use axum::routing::{post, get};
use crate::controllers::url_shortner_handler::{create_shorten_url, delete_url, get_key_insights, get_urls, update_url};
use crate::middlewares::url_shortner_middlewares::create_shorten_url_validation;

pub fn url_shortner_routes() -> Router {

    Router::new()
        .route("/create-url", post(create_shorten_url).layer(middleware::from_fn(create_shorten_url_validation)))
        .route("/get-urls", get(get_urls))
        .route("/update-url/{id}/{new_name}", get(update_url))
        .route("/delete-url/{id}", get(delete_url))
        .route("/key-insights/{id}", get(get_key_insights))
}
/*
from_fn_with_state, the middleware first parameter to be State(value) : State<T>
*/