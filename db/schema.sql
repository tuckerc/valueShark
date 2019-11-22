-- TABLE FOR USERS AND PORTFOLIO
-- 

-- DROP TABLE IF EXISTS  users, portfolios, companies, company_data;
DROP TABLE IF EXISTS users, portfolios;

CREATE TABLE users (
  name VARCHAR(255),
  id varchar(255) primary key
);

CREATE TABLE portfolios (
  id varchar(255) primary key,
  shares FLOAT,
  av_cost FLOAT,
  company_id int
);

-- CREATE TABLE companies (
--   id serial primary key,
--   ticker varchar(255),
--   name text,
--   description text,
--   industry text,
--   url text,
--   data_id int
-- );

-- CREATE TABLE company_data (
--   ticker varchar(255) primary key,
--   price varchar(255),
--   pe float,
--   pb float,
--   peg float,
--   profit_margin varchar(255),
--   market_cap varchar(255)
-- );

-- ADD/DELETE/EDIT PORTFOLIO