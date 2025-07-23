use axum::extract::{Path, State};
use axum::{Json};
use axum::http::{HeaderMap, HeaderValue, StatusCode};
use axum::response::IntoResponse;
use serde::{Serialize, Deserialize};
use sqlx::Error;
use crate::state::AppState;
use crate::middlewares::{create_authorization_header, hash_password, verify_password};

#[derive(Serialize, Deserialize)]
pub struct ErrorResponse{
    message: String,
}

impl ErrorResponse {
    pub fn new(message: String) -> Self {
        Self {
            message
        }
    }
}

#[derive(Serialize, sqlx::FromRow)]
pub struct  Country{
    id: i32,
    country: String,
    code: String,
}

#[derive(Serialize)]
pub struct FullCountries {
    countries: Vec<Country>,
}

pub async fn sign_in_handler(State(state):State<AppState> ,Path((username, password)): Path<(String, String)>)
                             -> Result<impl IntoResponse, (StatusCode, Json<ErrorResponse>)>
{

    // here we call the service that access the database
    let row: Result<(i32,String, String),_>  = sqlx::query_as("select id,username,password from users where username=$1 OR mail_id=$2")
        .bind(&username).bind(&username).fetch_one(&state.db_pool).await ;

    match row {
        Ok(row) => {
            let is_same = verify_password(&password,&row.2) ;

            match is_same {
                Ok(is_same) => {
                    if is_same {
                        tracing::info!("Correct credentials {:?}", row) ;
                        let header = create_authorization_header(String::from(&state.jwt_secret),row.0, row.1);
                        let mut headers = HeaderMap::new() ;
                        headers.insert("Authorization", HeaderValue::from_str(&header).unwrap()) ;
                        headers.insert("Access-Control-Expose-Headers" , HeaderValue::from_str("authorization").unwrap()) ;
                        Ok((
                            StatusCode::OK,
                            headers
                        ))
                    }else{
                        tracing::info!("Invalid Credentials") ;
                        Err(
                            (
                                StatusCode::NON_AUTHORITATIVE_INFORMATION,
                                    Json(ErrorResponse{
                                        message: "Invalid Password".to_string()
                                    })

                            )
                        )
                    }
                },
                Err(_) => {
                    tracing::info!("not a argon2 hash") ;
                    Err(
                        (
                            StatusCode::INTERNAL_SERVER_ERROR,
                                Json(ErrorResponse{
                                    message: "not a argon2 hash".to_string()
                                })

                        )
                    )
                }
            }

            
        },
        Err(err) => {
            tracing::error!("error was {}", err);
            Err((
                StatusCode::UNAUTHORIZED,
                Json(ErrorResponse {
                    message: "Invalid Credentials".to_string(),
                }),
            ))
        }
    }

}


pub async fn sign_up_handler(State(state):State<AppState> ,Path((username, password, mail_id, mobile, country_id)): Path<(String, String, String, String, i32)>)
                             -> Result<impl IntoResponse, (StatusCode, Json<ErrorResponse>)>
{
    let hash_password = hash_password(&password) ;
    // here we call the service that access the database
    let user: Result<(i32,),_> = sqlx::query_as(
        "INSERT INTO users (username, mail_id, password, mobile, country_id)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id"
    )
        .bind(&username)
        .bind(&mail_id)
        .bind(&hash_password)
        .bind(&mobile)
        .bind(&country_id)
        .fetch_one(&state.db_pool)  // Fetch the row
        .await;

   match user {
       Ok(user)=> {
           let header = create_authorization_header(String::from(&state.jwt_secret),user.0,username);
           tracing::info!("New User Created Successfully");
           let mut headers = HeaderMap::new();
           headers.insert("Authorization", HeaderValue::from_str(&header).unwrap()) ;
           headers.insert("Access-Control-Expose-Headers" , HeaderValue::from_str("authorization").unwrap()) ;
           Ok((
               StatusCode::CREATED,
               headers
           ))
       },
       Err(Error::Database(err)) => {
           match err.constraint() {
               Some("users_username_key") => {
                   Err((
                       StatusCode::CONFLICT,
                       Json(ErrorResponse::new("Username already Exists".to_string()))
                       ))
               },
               Some("users_mail_id_key") => {
                   Err((
                       StatusCode::CONFLICT,
                       Json(ErrorResponse::new("Email already Exists".to_string()))
                       ))
               },
               Some("users_mobile_key") => {
                   Err((
                       StatusCode::CONFLICT,
                       Json(ErrorResponse::new("Mobile already Exists".to_string()))
                   ))
               },
               Some("users_country_id_fkey") => {
                   Err((
                       StatusCode::BAD_REQUEST,
                       Json(ErrorResponse::new("Invalid Country id".to_string()))
                   ))
               },
               Some(c) => {
                   tracing::warn!("Unhandled constraint violation: {}", c);
                   Err((
                       StatusCode::BAD_REQUEST,
                       Json(ErrorResponse::new("Unhandled Constraint Violation".to_string()))
                   ))
               },
               None => {
                   tracing::error!("Database error: {}", err);
                   Err((
                       StatusCode::INTERNAL_SERVER_ERROR,
                       Json(ErrorResponse::new("Database Error".to_string()))
                   ))
               }
           }
       }
       Err(error) => {
           tracing::error!("error was {}", error) ;
           Err((
               StatusCode::INTERNAL_SERVER_ERROR,
               Json(ErrorResponse::new("Database Error".to_string()))
           ))
       }
   }
}


pub async fn get_countries_handler(State(state): State<AppState>) -> Result<impl IntoResponse, impl IntoResponse> {

    // getting all the countries
    let countries: Result<Vec<Country>,_> = sqlx::query_as::<_,Country>("select * from countries")
        .fetch_all(&state.db_pool).await ;

    match countries {
        Ok(countries) => {
            tracing::info!("Countries we got the data") ;
            Ok(
                (StatusCode::OK,
                    Json(
                        FullCountries {
                            countries
                        }
                    )
                )
            )

        },
        Err(error) => {
            tracing::error!("unable to get the countries data") ;
            Err(
                (StatusCode::INTERNAL_SERVER_ERROR,
                 Json(ErrorResponse {
                     message: "unable to get the data from database".to_string(),
                 })
                )
            )
        }
    }
}