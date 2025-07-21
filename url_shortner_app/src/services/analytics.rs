use aws_sdk_dynamodb::Client;
use proto_definations_snip_sight::generated::url_shortner::{Insight};

pub struct Analytics<'a>{
    client: &'a Client,
    shorten_url: String,
    records: Vec<Insight>
}

// all these things needs to work concurrently
impl<'a> Analytics<'a>{
    pub fn new(client: &'a Client, shorten_url: String) -> Self {
        Analytics {
            client,
            shorten_url,
            records: Vec::new()
        }
    }

    pub async fn set_records(&self){
        // it actually sets the records from the dynamo db
    }
    pub async fn top_insights(&self) {
        if self.records.is_empty() {
            self.set_records().await;
        } // it make sures to get all the requests
        // here we will get the unique users count (based on ip), top location, top os , top browser, top device
    }
    pub async fn device_type_pie(&self) {
        if self.records.is_empty() {
            self.set_records().await;
        }
    }
    pub async fn os_types_pie(&self) {
        if self.records.is_empty() {
            self.set_records().await;
        }
    }
    pub async fn view_hour_bar(&self) { // past 6 hours mostly
        if self.records.is_empty() {
            self.set_records().await;
        }
        // every hour views in a bar chart
    }
    pub async fn refferrers_pie(&self) {
        if self.records.is_empty() {
            self.set_records().await;
        }
        // we will return an pie of different refferals with percentages
    }
    pub async fn viewers_over_time_line(&self) {
        if self.records.is_empty() {
            self.set_records().await;
        }
        // from the time created to the time know
    }
    pub async fn view_location_points(&self) {
        if self.records.is_empty() {
            self.set_records().await;
        }
        // if we 1k views where 8 locations people watched we will show those 8 locations as points on the map
    }
    pub async fn get_ai_insights(&self) {
        if self.records.is_empty() {
            self.set_records().await;
        }
    }
}