use serde::Deserialize;
use validator::Validate;
use crate::middlewares::url_shortner_middlewares::validate_url_shortner_name;
#[derive(Deserialize, Debug, Validate )]
pub struct UrlShortenModel {
    #[validate(url)]
    pub original_url: String,
    #[validate(custom(function = "validate_url_shortner_name", message="Invalid url custom name"))]
    pub custom_url: Option<String>, // it can be None, if the user was not a premium member
}

