'use strict';

///////////////////////////////////////////
// Dependencies
///////////////////////////////////////////
const pg = require('pg');
const handlers = require('../js/handlers.js');

//////////////////////////////////////////////////
// Database Setup
//////////////////////////////////////////////////
const client = new pg.Client(process.env.DATABASE_URL);
client.connect();
client.on('error', err => handlers.errorHandler((err)));

//////////////////////////////////////////////////
// Function to add a company
//////////////////////////////////////////////////
function addCompany(data) {
  let sql = 'insert into companies (ticker, name, description, industry, url) values ($1, $2, $3, $4, $5) returning *';
  let values = [data.ticker, data.name, data.description, data.industry, data.url];
  return client.query(sql, values);
}

////////////////////////////////////////////////
////ADD USERS
///////////////////////////////////////////////
async function addUser(user) {
  // add new user
  let sql = 'INSERT INTO users (name, id) VALUES ($1, $2) returning *';
  let values = [user.name.toLowerCase(), user.id];
  const newUserQuery = client.query(sql,values);
  const newUserResult = await newUserQuery;
  newUserResult;

  // create portfolio for user
  sql = 'insert into portfolios (id) values ($1) returning *';
  values = [user.id];
  const newPortfolioQuery = client.query(sql, values);
  const newPortfolioResult = await newPortfolioQuery;
  return newPortfolioResult;
}

////////////////////////////////////////////////
// Auth User
////////////////////////////////////////////////
function authUser(user) {
  const sql = 'select * from users where id = $1 and name = $2';
  const values = [user.id, user.name];
  return client.query(sql, values);
}

//////////////////////////////////////////////////
// Function to retreive company
//////////////////////////////////////////////////
function getCompanies() {
  let sql = 'select * from companies';
  return client.query(sql);
}

//////////////////////////////////////////////////
// Function to update company financial data
//////////////////////////////////////////////////
async function updateCompanyData(company) {
  let sql = 'delete from company_data where ticker = $1';
  let values = [company.ticker];
  const deleteQuery = client.query(sql, values);
  const deleteResult = await deleteQuery;
  deleteResult;
  
  sql = 'insert into company_data (ticker, price, pe, pb, peg, profit_margin, market_cap) values ($1, $2, $3, $4, $5, $6, $7) returning *';
  values = [company.ticker, company.price, company.pe, company.pb, company.peg, company.profitMargin, company.marketCap];
  const updateQuery = client.query(sql, values);
  const updateResult = await updateQuery;
  return updateResult;
}

exports.addCompany = addCompany;
exports.getCompanies = getCompanies;
exports.updateCompanyData = updateCompanyData;
exports.addUser = addUser;
exports.authUser = authUser;
