use proto_definations_snip_sight::generated::url_shortner::{CreateShortenUrlPayload, Urls};
use sqlx::{Error, FromRow, Pool, Postgres, Row};
use sqlx::postgres::{PgDatabaseError, PgRow};
use tonic::Status;
use crate::models::{ShortenUrl, UrlModel, OriginalUrl};

pub async fn store_new_url(payload: CreateShortenUrlPayload, db: &Pool<Postgres>) -> Result<(String, i32), String> {

    let result = sqlx::query_as::<_, (String, i32)>("insert into website_urls (user_id, original_url, shorten_url) values ($1, $2, $3) RETURNING shorten_url,id")
        .bind(payload.user_id).bind(payload.original_url).bind(payload.custom_url)
        .fetch_one(db).await ;
    match result {
        Ok(result) => {
            tracing::info!("The output of the result was {:#?}", result) ;
            Ok(result)
        },
        Err(sqlx::Error::Database(error)) => {
            tracing::error!("error while inserting into website_urls was {}",error) ;
                match error.constraint() {
                    Some("unique_user_original_url") => {
                        tracing::warn!("The error got for getting same original url using again") ;
                        Err("Original Url already exists".to_string())
                    },
                    Some("website_urls_shorten_url_key") => {
                        tracing::warn!("The chosen shorten URL is already in use.");
                        Err("custom name already exists".to_string())
                    },
                    Some(other) => {
                        tracing::error!("Unhandled constraint: {}", other);
                        Err(format!("Database constraint violation: {}", other))
                    },
                    None => {
                        tracing::error!("No constraint info: {}", error);
                        Err("Database error occurred (no constraint info)".into())
                    }
                }
        },
        Err(err) => {
            tracing::info!("unExcepted from the Server {}", err) ;
            Err(err.to_string())
        }
    }
}

pub async fn get_urls(user_id: i32,page_number: u32, page_size: u32, db: &Pool<Postgres>) -> Result<Vec<Urls>, String> {

    tracing::info!("get urls was called with the user_id {}", user_id) ;
    tracing::info!("page size {} and page number {}", page_size, page_number) ;
    let offset = (page_number - 1) * page_size ;
    let urls = sqlx::query_as::<_, UrlModel>("select * from website_urls where user_id = $1 OFFSET $2 LIMIT $3")
    .bind(user_id).bind(offset as i32).bind(page_size as i32).fetch_all(db).await ;

    match urls {
        Ok(urls) => {
            tracing::info!("got the urls for the user_id {}",user_id) ;
            let mut urlss = vec![] ;
            for url in urls.iter() {
                urlss.push(Urls {
                    id: url.id,
                    original_url: url.original_url.to_string(),
                    shorten_url: url.shorten_url.to_string(),
                    view_count: url.view_count,
                    created_at: url.created_at.to_string()
                })
            }

            Ok(urlss)
        },
        Err(error) => {
            tracing::error!("Error Occured while getting urls {}",error) ;
            Err("Internal Server Error".to_string())
        }
    }

}

//* This feature is Currently Not there
pub async fn update_shorten_url_name(id: i32, name: &str, user_id: i32, db: &Pool<Postgres>) -> Result<bool, String> {

    tracing::info!("update shorten url name was called with the id {} and name {}", id, name) ;

    let result = sqlx::query("update website_urls SET shorten_url=$1 where id=$2 AND user_id=$3")
        .bind(name).bind(id).bind(user_id).execute(db).await ;

    match result {
        Ok(result) => {
            tracing::info!("update happened") ;
            if result.rows_affected() > 0 {
                Ok(true)
            }else {
                Err(String::from("Not Updated, the Id doesn't exists"))
            }
        },
        Err(err) => {
            tracing::error!("error occured while updating the shorten_url was {}", err) ;
            match err {
                Error::Io(err) => {
                    Err(String::from("error Occured while Communicating with the database") )
                },
                _ => {
                    Err(String::from("An unexpected database error occurred"))
                }
            }
        }
    }
}

pub async fn delete_url(id: i32, user_id: i32, db: &Pool<Postgres>) -> Result<String, String> {

    tracing::info!("delete url was called with the id {}", id) ;
    let result = sqlx::query_as::<_, ShortenUrl>("DELETE FROM website_urls WHERE id=$1 AND user_id=$2 RETURNING shorten_url")
        .bind(id).bind(user_id).fetch_one(db).await ;

    match result {
        Ok(result) => {
            tracing::info!("deletion happened") ;
            Ok(result.shorten_url)
        },
        Err(Error::RowNotFound) => {
            tracing::warn!("NO Row Found") ;
            Err("Row doesn't exists".to_string())
        },
        Err(error) => {
            tracing::error!("error while deleting the url was {}", error) ;
            match error {
                Error::Io(err) => {
                    Err(String::from("An I/O error Occurred while communicating with database") )
                },
                _ => {
                    Err(String::from("An unexpected database error occurred"))
                }
            }
        }
    }
}


pub async fn increase_view_count(shorten_url: &str, db: &Pool<Postgres>) -> Result<bool, String> {
    tracing::info!("increase_view_count was called with the shorten_url {}", shorten_url) ;
    let result = sqlx::query("update website_urls SET view_count=view_count+1 where shorten_url=$1")
        .bind(shorten_url).execute(db).await ;

    match result {
        Ok(res) => {
            tracing::info!("got the result") ;
            if res.rows_affected() > 0 {
                Ok(true)
            }else{
                Ok(false)
            }
        },
        Err(err) => {
            tracing::error!("The Error was {}", err) ;
            Err(err.to_string())
        }
    }
}

pub async fn get_original_url_service(shorten_url: &str, db: &Pool<Postgres>) -> Result<String, String> {
    tracing::info!("get_original_url was called with the shorten_url {}", shorten_url) ;
    let result = sqlx::query_as::<_, OriginalUrl>
        ("select original_url from website_urls where shorten_url=$1")
        .bind(shorten_url).fetch_one(db).await ;
    match result {
        Ok(res) => {
            tracing::info!("the res was {:?}", res) ;
            Ok(res.original_url)
        },
        Err(err) => {
            tracing::error!("error was {}", err) ;
            Err(err.to_string())
        }
    }
}