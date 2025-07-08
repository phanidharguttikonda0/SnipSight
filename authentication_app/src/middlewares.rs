use argon2::{Argon2, PasswordHasher, PasswordVerifier};
use argon2::password_hash::{SaltString, rand_core::OsRng, PasswordHash};
use chrono::Utc;
use serde::{Serialize, Deserialize};
use jsonwebtoken::{encode, Header, EncodingKey};
#[derive(Debug,Serialize, Deserialize)]
pub struct Claims{
    user_id:i32,
    username:String,
    exp: usize, // expiration timestamp in unix
}

impl Claims{
    fn new(user_id:i32, username:String, exp: usize) -> Self{
        Claims{
            user_id, username, exp
        }
    }
}

pub async fn create_authorization_header(jwt_secret: String,user_id: i32, username: String) -> String {
    let expiration = Utc::now()
        .checked_add_signed(chrono::Duration::days(7)).expect("error in expiration time")
        .timestamp() as usize;

    let claims = Claims::new(user_id, username, expiration) ;
    format!("Bearer {}", encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(jwt_secret.as_ref())
    ).expect("error in encoding key"))
}



pub fn hash_password(password: &str) -> String {
    let salt = SaltString::generate(&mut OsRng);
    let argon2 = Argon2::default();
    tracing::info!("Hashing password...");
    let password_hash = argon2.hash_password(password.as_bytes(), &salt)
        .expect("Hashing failed")
        .to_string();
    tracing::info!("Password hash : {}", password_hash);
    password_hash
}

pub fn verify_password(password: &str, hash: &str) -> bool {
    tracing::info!("Verifying password...");
    let parsed_hash = PasswordHash::new(hash).expect("Invalid hash");
    Argon2::default().verify_password(password.as_bytes(), &parsed_hash).is_ok()
}
