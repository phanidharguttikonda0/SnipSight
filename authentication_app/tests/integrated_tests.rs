use axum::body::Body;
use axum::http::StatusCode;
use sqlx::{Executor, PgPool, Pool, Postgres};
use tower::ServiceExt; // for .oneshot()
use authentication_app::create_app;
use authentication_app::middlewares::hash_password;

/*
    Everything is good now ready to write integrated tests
*/

async fn create_db() -> Pool<Postgres> {
    PgPool::connect("postgres://postgres:phani@localhost:5432/authentication").await.unwrap()
}
// sqlx migrate run --database-url postgres://postgres:phani@localhost:5432/authentication
async fn create_user(db: Pool<Postgres>,username: String, mut password: String, mail_id: String, mobile: String) {
    db.execute("delete from users").await.unwrap() ;

    sqlx::query("insert into country (country, code) values ($1,$2)")
        .bind("india")
        .bind("+91")
        .execute(&db).await.unwrap() ;
    password = hash_password(&password);
    sqlx::query("insert into users (username, password, mail_id, mobile, country_id) values ($1,$2,$3,$4,$5)")
        .bind(&username)
        .bind(&password).bind(&mail_id).bind(&mobile).bind(1).execute(&db).await.unwrap() ;
}
#[tokio::test]
async fn sign_in_check() {

    let db_connection = create_db().await ;
    let app = create_app(db_connection.clone(), "phani".to_string());

    // let's create a user
    create_user(db_connection, "phani".to_string(), "password".to_string(), "mail".to_string(), "mobile".to_string()).await;

    let response1 = app.clone().oneshot(
        axum::http::Request::builder()
            .method("GET")
            .uri("/sign-in/phani/password")
            .body(Body::empty())
        .unwrap()
    ).await.unwrap();

    let response2 = app.oneshot(
        axum::http::Request::builder()
            .method("GET")
            .uri("/sign-in/phani/phani")
        .body(Body::empty())
        .unwrap()
    ).await.unwrap();
    tracing::info!("response was let me check it out");

    assert_eq!(response1.status(), StatusCode::OK);
    assert_eq!(response2.status(), StatusCode::NON_AUTHORITATIVE_INFORMATION);
}

#[tokio::test]
async fn sign_up_check() {
    let db_connection = create_db().await ;

    let app = create_app(db_connection.clone(), "phani".to_string());

    // let's create a user
    create_user(db_connection, "phanidharreddy".to_string(), "password".to_string(), "phani@gmail.com".to_string(), "8885858760".to_string()).await;

    let response1 = app.clone().oneshot(
        axum::http::Request::builder()
            .method("GET")
        .uri("/sign-up/phanidharreddy2/password/phani@gmail.com/8885858765/1")
        .body(Body::empty())
        .unwrap()
    ).await.unwrap();
    let response2 = app.oneshot(
        axum::http::Request::builder()
            .method("GET")
            .uri("/sign-up/phanidharreddy_/password/phani1@gmail.com/8885858769/1")
            .body(Body::empty())
        .unwrap()
    ).await.unwrap();
    tracing::info!("response was let me check it out");

    assert_eq!(response1.status(), StatusCode::CONFLICT);
    assert_eq!(response2.status(), StatusCode::OK);
}



/*
 no more rules for integrated tests , just the folder name is tests , then cargo test
 will run all the files inside the tests folder that's it
*/
