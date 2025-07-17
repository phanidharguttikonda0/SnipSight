use proto_definations_snip_sight::generated::url_shortner::{CreateShortenUrlPayload, Urls};
use sqlx::{Error, FromRow, Pool, Postgres, Row};
use sqlx::postgres::PgRow;
use tonic::Status;
use crate::models::UrlModel;

pub async fn store_new_url(payload: CreateShortenUrlPayload, db: &Pool<Postgres>) -> Result<(String, i32), String> {

    let result = sqlx::query_as::<_, (String, i32)>("insert into website_urls (user_id, original_url, shorten_url) values ($1, $2, $3) RETURNING shorten_url,id")
        .bind(payload.user_id).bind(payload.original_url).bind(payload.custom_url)
        .fetch_one(db).await ;
    match result {
        Ok(result) => {
            tracing::info!("The output of the result was {:#?}", result) ;
            Ok(result)
        },
        Err(error) => {
            tracing::error!("error while inserting into website_urls was {}",error) ;
            Err(error.to_string())
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
            Err(String::from("Internal Server Error"))
        }
    }

}