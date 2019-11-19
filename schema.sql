DROP TABLE IF EXISTS  users,portfolios;

CREATE TABLE users (
    name VARCHAR,
    id VARCHAR(255),
    portfolio_id INT

)
CREATE TABLE portfolios (
    id VARCHAR(255),
    shares FLOAT,
    av_cost FLOAT

)