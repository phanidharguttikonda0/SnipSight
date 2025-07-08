CREATE TABLE users (
    id serial primary key,
    username varchar(50) unique not null,
    mail_id varchar(320) unique not null,
    mobile varchar(10) unique not null,
    country_id fk not null,
    password TEXT not null -- storing argon2 hash (which slow but highly secure)
);

create table country (
    id serial primary key,
    code varchar(4) not null, -- country code like +91 for india
    country varchar(100) not null
);