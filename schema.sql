-- TABLE FOR USERS AND PORTFOLIO

DROP TABLE IF EXISTS  users;

CREATE TABLE users (
    name VARCHAR,
    id VARCHAR(255),
    portfolio_id INT,

)

DROP TABLE IF EXISTS portfolio;

CREATE TABLE portfolio (
    id VARCHAR(255),
    shares FLOAT,
    av_cost FLOAT,

)

-- ADD/DELETE/EDIT PORTFOLIO







