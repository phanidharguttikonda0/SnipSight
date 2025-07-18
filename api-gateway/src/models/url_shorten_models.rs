use serde::{Deserialize, Serialize};
use validator::Validate;
use crate::middlewares::url_shortner_middlewares::validate_url_shortner_name;
#[derive(Deserialize, Debug, Validate )]
pub struct UrlShortenModel {
    #[validate(url)]
    pub original_url: String,
    #[validate(custom(function = "validate_url_shortner_name", message="Invalid url custom name"))]
    pub custom_url: Option<String>, // it can be None, if the user was not a premium member
}

#[derive(Deserialize, Debug)]
pub struct PaginationParams {
    pub page_size: Option<u32>,
    pub page_number: Option<u32>,
}

#[derive(Debug, Serialize)]
pub struct KeyInsights {
    pub insights: Vec<Insight>
}

#[derive(Serialize, Debug)]
pub struct Insight{
    pub ip_address: String,
    pub location: String,
    pub timestamp: String,
    pub refferal_source: String,
    pub others: Others
}

#[derive(Serialize, Debug)]
pub struct Others {
    pub device_type: String,
    pub browser: String,
    pub os: String
}
