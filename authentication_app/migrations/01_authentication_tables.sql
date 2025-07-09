CREATE TABLE country (
                         id SERIAL PRIMARY KEY,
                         code VARCHAR(4) NOT NULL,         -- e.g., '+91'
                         country VARCHAR(100) NOT NULL
);

CREATE TABLE users (
                       id SERIAL PRIMARY KEY,
                       username VARCHAR(50) UNIQUE NOT NULL,
                       mail_id VARCHAR(320) UNIQUE NOT NULL,
                       mobile VARCHAR(10) UNIQUE NOT NULL,
                       country_id INTEGER NOT NULL,
                       password TEXT NOT NULL,           -- stores argon2 hashed password
                       FOREIGN KEY (country_id) REFERENCES country(id)
);
