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

///////////////////////////////////////////////////
// Function for clearing all company data
///////////////////////////////////////////////////
function deleteCompanies() {
  let sql = 'delete from companies';
  client.query(sql);
  sql = 'delete from company_data';
  client.query(sql);
}

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
  let values = [user.name, user.id];
  
  return client.query(sql,values);
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
  console.log(company);
  
  let sql = 'delete from company_data using companies where company_data.company_id = companies.id and companies.ticker = $1';
  let values = [company.ticker];
  const deleteQuery = client.query(sql, values);
  const deleteResult = await deleteQuery;
  deleteResult;
  
  sql = 'insert into company_data (price, pe, pb, peg, profit_margin, market_cap) values ($1, $2, $3, $4, $5, $6) returning *';
  values = [company.price, company.pe, company.pb, company.peg, company.profitMargin, company.marketCap];
  const updateQuery = client.query(sql, values);
  const updateResult = await updateQuery;
  return updateResult;
}

////////////////////////////////////////////////////////////////////
// function to add a company to a portfolio
////////////////////////////////////////////////////////////////////
function addNewStock(userID, ticker) {
  let sql = 'insert into portfolios (id, ticker) values ($1, $2) returning *';
  let values = [userID, ticker];
  return client.query(sql, values);
}

//////////////////////////////////////////////////
// Function to get data for Data Table
//////////////////////////////////////////////////
function getTable(req, res) {
  let SQL = "select * from companies inner join company_data on companies.id = company_data.company_id where company_data.peg > 0 and cast(rtrim(company_data.profit_margin, ' % ') as float) > 15 order by company_data.peg limit 15";
  return client.query(SQL);
    
}


//////////////////////////////////////////////////////////////////
// function to delete a company from a portfolio
//////////////////////////////////////////////////////////////////
function deletePortfolio(id, ticker) {
  let sql = 'delete from portfolios where user_id = $1 and ticker = $2 returning *';
  let values = [id, ticker];
  return client.query(sql, values);
}

////////////////////////////////////////////////////////////////////
// function to update a company in a portfolio
////////////////////////////////////////////////////////////////////
function updatePortfolio(userID, ticker, shares, avgCost) {
  let sql = 'update portfolios set shares = $1, av_cost = $2 where user_id = $3 and tickdr = $4 returning *';
  let values = [shares, avgCost, userID, ticker];
  return client.query(sql, values);
}

///////////////////////////////////////////////////////////////////
// function to pull portfolio data for user
///////////////////////////////////////////////////////////////////
function getPortfolio(userID) {
  let sql = 'select users.id as userID, users.name as userName, portfolios.shares, portfolios.av_cost, companies.name as companyName, companies.ticker, company_data.price from users left outer join portfolios on users.id = portfolios.user_id left outer join companies on portfolios.company_id = companies.id left outer join company_data on companies.id = company_data.company_id where users.id = $1';
  const uID = String(userID);
  let values = [uID];
  return client.query(sql, values);
}


exports.addCompany = addCompany;
exports.getCompanies = getCompanies;
exports.updateCompanyData = updateCompanyData;
exports.addUser = addUser;
exports.authUser = authUser;
exports.addNewStock = addNewStock;
exports.updatePortfolio = updatePortfolio;
exports.deletePortfolio = deletePortfolio;
exports.getTable = getTable;
exports.getPortfolio = getPortfolio;
exports.deleteCompanies = deleteCompanies;