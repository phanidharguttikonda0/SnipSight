use serde::{Deserialize, Serialize};
use validator::Validate;
use crate::middlewares::authentication_middlewares::{validate_digits_only, validate_username_or_mail_id_check, username_check};

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct Claims{
    pub user_id: i32,
    pub username: String
}

#[derive(Debug, Deserialize, Validate)]
pub struct Login{
    #[validate(custom(function="validate_username_or_mail_id_check", message = "Invalid username or mail-id"))]
    pub username: String, // this can be username or mail_id
    #[validate(length(min = 8))]
    pub password: String,
}

#[derive(Debug, Deserialize, Validate)]
pub struct Register{
    #[validate(custom(function="username_check", message = "Invalid username"))]
    pub username: String,
    #[validate(length(min = 8))]
    pub password: String,
    #[validate(email)]
    pub mail_id: String,
    #[validate(length(min = 10, max = 10))]
    #[validate(custom(function="validate_digits_only", message = "Invalid mobile number"))]
    pub mobile: String,
    pub country_id : i32
}

