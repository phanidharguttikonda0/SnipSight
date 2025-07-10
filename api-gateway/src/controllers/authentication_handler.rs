use axum::Form;
use axum::response::IntoResponse;
use crate::models::authentication_models::{Login, Register};

pub async fn sign_in(Form(login) :Form<Login>) -> impl IntoResponse{}

pub async fn sign_up(Form(register) :Form<Register>) -> impl IntoResponse{}