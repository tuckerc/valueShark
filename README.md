# valueShark

DEVELOPERS:
Chase Tucker, Jerica Mitchel, Tyler Lawson and Amy Evans

OUR APP:
We are developing an app that allows value stock inverstors to search for a particular stock, see a table of best valued stocks, and add them to their portofio.

PROBLEM DOMAIN:
Right now there isn't any tool available for an investor to easily find and sort the best valued stocks out there, without knowing specifically what they are looking for.

DEPENDENCIES:
    "cookie": "^0.4.0",
    "cookie-parser": "^1.4.4",
    "cors": "^2.8.5",
    "dotenv": "^8.2.0",
    "ejs": "^2.7.4",
    "express": "^4.17.1",
    "express-session": "^1.17.0",
    "node-schedule": "^1.3.2",
    "nodemon": "^1.19.4",
    "pg": "^7.14.0",
    "request": "^2.88.0",
    "superagent": "^5.1.0",
    "xhr2": "^0.2.0"

APIS:
MorningStar API
Yahoo Finance API

USER INSTRUCTIONS
The user would need to enter their login name, and it would either create a new ID for them, or pull up their existing user portfolio.  At this time, they can enter in a ticker symbol and get information on a particular stock, and choose to see more about it, or enter it to their portfolio to follow.

API ENDPOINTS
https://rapidapi.com/apidojo/api/yahoo-finance1?endpoint=apiendpoint_aeccfc9c-66eb-4f4a-abf5-c14d952e09f6

    Name: Amazon.com, Inc.
    Symbol:  AMZN
    Price:  1,742.57
    P/E:  77.21
    PEG:  1.67
    Profit Margin:  4.27%
    Market Cap:  863.96B
    PB:  15.26


<!-- stores the user name from login and assigns them a unigue userID -->
CREATE TABLE users (
name VARCHAR(255),
id varchar(255) primary key
);

<!-- Allows the user to save stocks they own, with shares owned and average cost per share owned -->
CREATE TABLE portfolios (
  id varchar(255) primary key,
  shares FLOAT,
  av_cost FLOAT,
  ticker varchar(255)
);
<!-- Creates a database that had a storage of NASDAQ listed companies, their ticker smybol, company name, a description of their company,what industry they are in, and the company url-->
CREATE TABLE companies (
id serial primary key,
ticker varchar(255),
name text,
description text,
industry text,
url text,
data_id int
);

<!-- Creates a database with additional company data, including their P/E, PEG, PB, Profit Margin and Market Cap-->
CREATE TABLE company_data (
  ticker varchar(255) primary key,
  price varchar(255),
  pe float,
  pb float,
  peg float,
  profit_margin varchar(255),
  market_cap varchar(255)
);