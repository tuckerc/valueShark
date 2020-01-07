-- TABLE FOR USERS AND PORTFOLIO
-- 

-- DROP TABLE IF EXISTS  users, portfolios, companies, company_data;
DROP TABLE IF EXISTS  portfolios, company_data;


-- DROP TABLE IF EXISTS users, portfolios;

-- CREATE TABLE users (
--   name VARCHAR(255),
--   id serial primary key
-- );

-- CREATE TABLE companies (
--   id serial primary key,
--   ticker varchar(255),
--   name text,
--   description text,
--   industry text,
--   url text
-- );

CREATE TABLE portfolios (
  id serial primary key,
  user_id int references users(id),
  shares FLOAT,
  av_cost FLOAT,
  company_id int references companies(id) on delete cascade
);

CREATE TABLE company_data (
  id serial primary key,
  company_id int references companies(id) on delete cascade,
  price float,
  pe float,
  pb float,
  peg float,
  profit_margin float,
  market_cap float
);

-- ADD/DELETE/EDIT PORTFOLIO