-- TABLE FOR USERS AND PORTFOLIO
-- 

-- DROP TABLE IF EXISTS  users, portfolios, companies, company_data;
DROP TABLE IF EXISTS  company_data;

-- CREATE TABLE users (
--   name VARCHAR,
--   id serial primary key,
--   portfolio_id int
-- );

-- CREATE TABLE portfolios (
--   id serial primary key,
--   shares FLOAT,
--   av_cost FLOAT,
--   user_id int,
--   company_id int
-- );

-- CREATE TABLE companies (
--   id serial primary key,
--   ticker varchar(255),
--   name text,
--   description text,
--   industry text,
--   url text,
--   data_id int
-- );

CREATE TABLE company_data (
  ticker varchar(255) primary key,
  price varchar(255),
  pe float,
  pb float,
  peg float,
  profit_margin varchar(255),
  market_cap varchar(255)
);

-- ADD/DELETE/EDIT PORTFOLIO