use std::collections::HashMap;
use aws_config::BehaviorVersion;
use aws_sdk_sqs::Client;
use proto_definations_snip_sight::generated::url_shortner::{GetInsights, Insight, KeyInsights};
use crate::models::DeleteInsight;
use serde_json::to_string;
use aws_sdk_dynamodb::Client as DynamoClient;
use aws_sdk_dynamodb::types::AttributeValue;

pub async fn get_insights(request : GetInsights, client: &DynamoClient) -> Result<KeyInsights, String>{
    // here we need to get the insights from the dynamo db
    tracing::info!("Getting insights from Dynamo DB");

    let mut last_key = HashMap::new();
    last_key.insert("shorten_url".to_string(), AttributeValue::S(request.shorten_url.clone()));
    last_key.insert("insight_time".to_string(), AttributeValue::S(request.last_evaluated_key.clone())) ;// here last_evaluated_key was the insight time

    let query = client.query()
        .table_name("ShortenURLInsights")
        .key_condition_expression("shorten_url = :s")
        .expression_attribute_values(":s", AttributeValue::S(request.shorten_url.clone()))
        .scan_index_forward(false)
        .limit(request.page_size as i32)
        .set_exclusive_start_key(Some(last_key));

    let result = query.send().await.map_err(|e| {
        Err(e.to_string())
    });
    match result {
        Ok(result) => {
            let items = result.items();

            let insights = items
                .into_iter()
                .filter_map(|item| {
                    Some(Insight {
                        ip_address: item.get("ip_address")?.as_s().ok()?.to_string(),
                        refferal_source: item.get("refferal_source")?.as_s().ok()?.to_string(),
                        device_type: item.get("device_type")?.as_s().ok()?.to_string(),
                        browser: item.get("browser")?.as_s().ok()?.to_string(),
                        os: item.get("os")?.as_s().ok()?.to_string(),
                        location: item.get("location")?.as_s().unwrap_or(&"".into()).to_string(),
                        insight_time: item.get("insight_time")?.as_s().ok()?.to_string(),
                    })
                })
                .collect::<Vec<Insight>>();

            let (shorten_url, insight_time) = match result.last_evaluated_key() {
                Some(key_map) => (
                    key_map.get("shorten_url").and_then(|v| v.as_s().ok()).unwrap_or(&request.shorten_url).to_string(),
                    key_map.get("insight_time").and_then(|v| v.as_s().ok()).unwrap_or(&String::from("")).to_string(),
                ),
                None => (request.shorten_url.clone(), "".to_string()), // fallback
                // this executes, when there are no more records down the line
            };

            Ok(KeyInsights {
                list: insights,
                shorten_url,
                insight_time,
            })
        },
        Err(err) => {
            match err {
                Ok(err) => {
                    tracing::error!("Error getting insights from Dynamo DB inside Error OK was {}", err);
                    Err(err)
                },
                Err(err) => {
                    tracing::error!("Error getting insights from Dynamo DB inside Error Err was {}", err);
                    Err(err.to_string())
                }
            }
        }
    }
}

pub async fn delete_insights(shorten_url : String) -> Result<String, String>{
    // here we need to add the delete operation to the SQS
    let config = aws_config::load_defaults(BehaviorVersion::v2025_01_17()).await;
    let client = Client::new(&config);
    tracing::info!("Sending message to SQS for DELETE_INSIGHT");
    // Your FIFO queue URL (get this from AWS Console)
    let queue_url = "https://sqs.ap-south-1.amazonaws.com/637423550786/snipsightmessages.fifo";
    let delete_insight = DeleteInsight {message_type: "DELETE_INSIGHT".to_string(), shorten_url} ;
    let message_body = to_string(&delete_insight).unwrap();
    let resp = client.send_message()
        .queue_url(queue_url).message_body(message_body).message_group_id("delete-event")
        .message_deduplication_id(uuid::Uuid::new_v4().to_string()).send().await;
    match resp {
        Ok(resp) => {
            Ok(resp.message_id.unwrap())
        },
        Err(err) => {
            tracing::error!("Error sending message to SQS for Delete INSIGHT was {}", err);
            Err(err.to_string())
        }
    }
}