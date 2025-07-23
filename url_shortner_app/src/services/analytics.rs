use std::sync::Arc;
use aws_sdk_dynamodb::Client;
use proto_definations_snip_sight::generated::url_shortner::{Insight};
use tokio::sync::RwLock;
use crate::models::TopInsights;

#[derive(Clone)]
pub struct Analytics{
    client: Arc<Client>,
    shorten_url: Arc<String>,
    records: Arc<Vec<Insight>>,
    // from here we are going to return the data
    device_pie: Arc<Vec<(String, f32)>>,
    refferrers_pie: Arc<Vec<(String, f32)>>,
    os_pie: Arc<Vec<(String, f32)>>,
    top_insights: Option<Arc<TopInsights>>,
    past_six_hours: Arc<Vec<u32>>, // each index is the hour, the size will be 6 for 6 hours each hour views
    list_of_location_points: Arc<Vec<(String, i32)>> // each location and their count
    // remaining was views over time line
}

// all these things needs to work concurrently
impl Analytics{
    fn new(client: Client, shorten_url: String) -> Self {
        Analytics {
            client: Arc::new(client),
            shorten_url: Arc::new(shorten_url),
            records: Arc::new(Vec::new()),
            device_pie: Arc::new(Vec::new()),
            refferrers_pie: Arc::new(Vec::new()),
            list_of_location_points: Arc::new(Vec::new()),
            os_pie: Arc::new(Vec::new()),
            past_six_hours: Arc::new(Vec::new()),
            top_insights: None,
        }
    }
    // implementing the concurrency logic inside each method

    async fn set_records(&self){
        // it actually sets the records from the dynamo db
    }
    async fn top_insights(&mut self) {
        if self.records.is_empty() {
            self.set_records().await;
        } // it make sures to get all the requests
        // here we will get the unique users count (based on ip), top location, top os , top browser, top device, top refferrer

        
    }
    async fn device_type_pie(&mut self) {
        if self.records.is_empty() {
            self.set_records().await;
        }
    }
    async fn os_types_pie(&mut self) {
        if self.records.is_empty() {
            self.set_records().await;
        }
    }
    async fn view_hour_bar(&mut self) { // past 6 hours mostly
        if self.records.is_empty() {
            self.set_records().await;
        }
        // every hour views in a bar chart
    }
    async fn refferrers_pie(&mut self) {
        if self.records.is_empty() {
            self.set_records().await;
        }
        // we will return an pie of different refferals with percentages
    }
    async fn viewers_over_time_line(&mut self) {
        if self.records.is_empty() {
            self.set_records().await;
        }
        // from the time created to the time know
    }
    async fn view_location_points(&mut self) {
        if self.records.is_empty() {
            self.set_records().await;
        }
        // if we 1k views where 8 locations people watched we will show those 8 locations as points on the map
    }
    async fn get_ai_insights(&mut self) {
        if self.records.is_empty() {
            self.set_records().await;
        }
    }

}