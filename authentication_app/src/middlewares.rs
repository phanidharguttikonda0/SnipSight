

pub async fn create_authorization_header(jwt_secret: String,user_id: i32, username: String) -> String {
    String::from("Bearer Token, means expiry token")
}