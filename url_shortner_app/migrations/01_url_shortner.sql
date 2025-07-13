CREATE TABLE website_urls (
   id SERIAL PRIMARY KEY,
   user_id INT NOT NULL, -- for the same user the original url should not be the same
   original_url varchar(1200) NOT NULL,
   shorten_url VARCHAR(100) unique NOT NULL, -- it stores only the custom name not the whole url
   view_count INT NOT NULL DEFAULT 0,
   created_at TIMESTAMP NOT NULL DEFAULT NOW(),

       -- Prevent duplicate original_url for same user
   CONSTRAINT unique_user_original_url UNIQUE (user_id, original_url)
);