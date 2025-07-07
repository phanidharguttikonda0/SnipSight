use axum::extract::{Path, State};
use axum::{Form, Json};
use axum::http::StatusCode;
use axum::response::IntoResponse;
use serde::{Serialize, Deserialize};
use crate::AppState;
use crate::middlewares::create_authorization_header;

#[derive(Serialize)]
pub struct Header {
    header: String,
}
#[derive(Serialize)]
pub struct ErrorResponse{
    error: String,
}

pub async fn sign_in_handler(State(state):State<AppState> ,Path((username, password)): Path<(String, String)>)
                             -> Result<impl IntoResponse, impl IntoResponse>
{

    // here we call the service that access the database
    let row: Result<(i32,String),_>  = sqlx::query_as("select id,username from users where (username=$1 OR mail_id=$2) AND password=$3")
        .bind(&username).bind(&username).bind(password).fetch_one(&state.db_pool).await ;

    match row {
        Ok(row) => {
            tracing::info!("Correct credentials {:?}", row) ;
            let header = create_authorization_header(String::from(&state.jwt_secret),row.0, row.1).await;

            Ok((
                StatusCode::OK,
                Json(Header { header })
            ))
        },
        Err(err) => {
            tracing::error!("error was {}", err);
            Err((
                StatusCode::NOT_FOUND,
                Json(ErrorResponse {
                    error: "Incorrect Credentials".to_string(),
                }),
            ))
        }
    }

}


pub async fn sign_up_handler(State(state):State<AppState> ,Path((username, password, mail_id, mobile, country_id)): Path<(String, String, String, String, i32)>)
                             -> Result<impl IntoResponse, impl IntoResponse>
{

    // here we call the service that access the database
    let user: Result<(i32,),_> = sqlx::query_as(
        "INSERT INTO users (username, mail_id, password, mobile, country_id)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id"
    )
        .bind(&username)
        .bind(&mail_id)
        .bind(&password)
        .bind(&mobile)
        .bind(&country_id)
        .fetch_one(&state.db_pool)  // Fetch the row
        .await;

   match user {
       Ok(user)=> {
           let header = create_authorization_header(String::from(&state.jwt_secret),user.0,username).await;
           tracing::info!("New User Created Successfully");
           Ok((
               StatusCode::OK,
               Json(Header { header })
           ))
       },
       Err(error) => {
           tracing::error!("error was {}", error) ;
           Err((
                   StatusCode::CONFLICT,
                   Json(ErrorResponse {
                       error: "make sure all are unique".to_string(),
                   })
           ))
       }
   }
    
    
}
