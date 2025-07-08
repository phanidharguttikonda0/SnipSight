use argon2::{Argon2, PasswordHasher, PasswordVerifier};
use argon2::password_hash::{SaltString, PasswordHash, rand_core::OsRng};
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

pub fn create_authorization_header(jwt_secret: String,user_id: i32, username: String) -> String {
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


// if we mention #[cfg(test)] then docker will not copy the following code, when copying the file right
#[cfg(test)]
mod tests {
    use super::*; // what does this do ?

    #[test]
    fn test_authorization_header_creation(){
        tracing_subscriber::fmt().init();
        tracing::info!("Creating authorization header...");
        let header = create_authorization_header(
            String::from("phani"), 1, String::from("phanidhar"));
        tracing::info!("Header was : {:?}", header);
    }

    #[test]
    fn test_password_hash_verification() {
        tracing_subscriber::fmt().init();
        let hashed_password = hash_password("phani") ;
        tracing::info!("Hashed password was : {:?}", hashed_password);
        let is_correct = verify_password("phani", &hashed_password) ;
        assert!(is_correct);
    }

    // why async functions are not used in tests ?
    /*
        Answer : we can use async functions in tests but we need to use a async test runtime
        like #[tokio::test]
    */
}