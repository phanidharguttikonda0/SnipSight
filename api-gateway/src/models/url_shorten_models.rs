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
#[derive(Clone)]
pub struct Insight{
    pub ip_address: String,
    pub refferal: String,
    pub device_type: String,
    pub browser: String,
    pub os: String
}

impl Insight {
    pub fn new(ip_address: String, refferal: String, device_type: String, browser: String, os: String) -> Self {
        Self {
            ip_address,
            refferal,
            device_type,
            browser,
            os
        }
    }
}

#[derive(Serialize)]
pub struct InsightEvent {
    pub message_type: String,
    pub shorten_url: String,
    pub ip_address: String,
    pub refferal_source: String,
    pub device_type: String,
    pub browser: String,
    pub os: String,
}

impl InsightEvent {
    pub fn new(shorten_url: String, ip_address: String, refferal_source: String, device_type: String, browser: String, os: String) -> Self {
        Self {
            message_type: "CREATE_INSIGHT".to_string(),
            shorten_url,
            ip_address,
            refferal_source,
            device_type,
            browser,
            os
        }
    }
}