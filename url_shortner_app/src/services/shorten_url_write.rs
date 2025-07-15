use proto_definations_snip_sight::generated::url_shortner::CreateShortenUrlPayload;
use sqlx::{Pool, Postgres};

pub async fn store_new_url(payload: CreateShortenUrlPayload, db: &Pool<Postgres>) -> Result<(String, i64), String> {

    let result = sqlx::query_as::<_, (String, i64)>("insert into website_urls (user_id, original_url, shorten_url) values ($1, $2, $3) RETURNING shorten_url,id")
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