'use strict';

/////////////////////////////////////////////////
// Dependencies
/////////////////////////////////////////////////
const superagent = require('superagent');
const request = require('request');
const db = require('../db/db.js');

/////////////////////////////////////////////////
// Constructors
/////////////////////////////////////////////////
function Symbol(data) {
  this.symbol = data.symbol;
  if(data.financialData.currentPrice)
    this.price = data.financialData.currentPrice.fmt;
  if(data.summaryDetail.trailingPE) 
    this.pe = data.summaryDetail.trailingPE.fmt;
  if(data.defaultKeyStatistics.priceToBook) 
    this.pb = data.defaultKeyStatistics.priceToBook.fmt;
  if(data.defaultKeyStatistics.pegRatio)
    this.peg = data.defaultKeyStatistics.pegRatio.fmt;
  if(data.financialData.profitMargins) 
    this.profitMargin = data.financialData.profitMargins.fmt;
  this.name = data.quoteType.shortName;
  if(data.price.marketCap)
    this.marketCap = data.price.marketCap.fmt;
}

function Company(data) {
  if (data.id) this.id = data.id;
  if(data.companyName) this.name = data.companyName;
  else if(data.name) this.name = data.name;
  this.ticker = data.ticker;
  if (data.description) this.description = data.description;
  if (data.industry) this.industry = data.industry;
  if (data.url) this.url = data.url;
}

function User(name) {
  // console.log(name)
  this.name = name;
}


//////////////////////////////////////////////////////////
///////ADDING A FUNCTION  FOR PORTFOLIO
//////////////////////////////////////////////////////////

function usersHandler(req, res) {
  let names = req.body.userfield;
  const newUser = new User(names);
  console.log(newUser)
  // console.log(newUser)
  // console.log(db.addUser(new User(names)));

  res.redirect('/');

  // res.send(client.query(SQL,values)
  // .then(console.log(values))
  // .catch(err => handleError(err, res)));
}


////////////////////////////////////////////////////////////
/////////DELETING NAMES FROM DATABASE
////////////////////////////////////////////////////////////
// function deleteUsers(req,res) {
//   let names = req.body.userfield;
//   const oldUser = oldUser;

// }

//////////////////////////////////////////////////////////
// function to load data for entire NASDAQ
//////////////////////////////////////////////////////////
async function updateCompanyData() {
  let returnArr = [];

  let firstQuery = new Promise((resolve, reject) => {
    const options = {
      method: 'GET',
      url: 'https://morningstar1.p.rapidapi.com/companies/list-by-exchange',
      qs: { Mic: 'XNAS' },
      headers: {
        'x-rapidapi-host': 'morningstar1.p.rapidapi.com',
        'x-rapidapi-key': process.env.RAPID_API_KEY,
        accept: 'json'
      }
    };

    request(options, function (error, response, body) {
      if (error) throw new Error(error);
      let parsedBody = JSON.parse(body);
      console.log(body);
      parsedBody.results.forEach(company => {
        returnArr.push(new Company(company));
      });
      resolve('first query success');
      reject('Error in first Query');
    })
  });

  const firstResult = await firstQuery;

  firstResult;

  let secondQuery = new Promise((resolve, reject) => {
    returnArr.forEach((company, idx) => {
      const options = {
        method: 'GET',
        url: 'https://morningstar1.p.rapidapi.com/companies/get-company-profile',
        qs: { Ticker: `${company.ticker}`, Mic: 'XNAS' },
        headers: {
          'x-rapidapi-host': 'morningstar1.p.rapidapi.com',
          'x-rapidapi-key': process.env.RAPID_API_KEY,
          accept: 'string'
        }
      };

      setTimeout(request, 1000 * idx, options, (error, response, body) => {
        if (error) throw new Error(error);
        // const textBody = JSON.stringify(body);
        console.log(company.name + ': ' + body);
        const bodyCheck = body.substring(0, 9);
        if (bodyCheck === '{"result"') {
          let parsedBody = JSON.parse(body);
          if (parsedBody.result) {
            company.description = parsedBody.result.businessDescription.value;
            company.industry = parsedBody.result.industry.value;
            company.url = parsedBody.result.contact.url;
          }
        }

        db.addCompany(company);
      });
    });
    resolve('good second query');
    reject('bad second query');
  });

  let secondResult = await secondQuery;

  secondResult;

  let success = new Promise((resolve, reject) => {
    console.log(`companies table updated: ${Math.floor(Date.now() / 1000)}`);
    resolve('success');
    reject('failure');
  });

  let lastResult = await success;

  lastResult;
}

//////////////////////////////////////////////////
// Function to get financial data for each company
//////////////////////////////////////////////////
function _getCoFinData(ticker) {
  // superagent.get('https://apidojo-yahoo-finance-v1.p.rapidapi.com/stock/v2/get-statistics')
  //   .set('x-rapidapi-host', 'apidojo-yahoo-finance-v1.p.rapidapi.com')
  //   .set('x-rapidapi-key', process.env.RAPID_API_KEY)
  //   .send({region:'US', symbol:'aapl'})
  //   .then( result => {
  //     return result;
  //   })
  //   .catch(err => console.log(err));
  
}

//////////////////////////////////////////////////
// function to update the financial data
// for every company in the database
//////////////////////////////////////////////////
async function updateCoFinData() {
  let tempArr = [];
  let getTickers = db.getCompanies()
    .then(result => {
      result.rows.forEach(company => {
        tempArr.push(new Company(company));
      })
    })
    .catch(err => console.log(err));

  let tickersResults = await getTickers;

  tickersResults;

  
  
  let getData = tempArr.forEach((company, idx) => {
    const options = {
      method: 'GET',
      url: 'https://apidojo-yahoo-finance-v1.p.rapidapi.com/stock/v2/get-statistics',
      qs: {region: 'US', symbol: company.ticker},
      headers: {
        'x-rapidapi-host': 'apidojo-yahoo-finance-v1.p.rapidapi.com',
        'x-rapidapi-key': process.env.RAPID_API_KEY
      }
    };
    
    setTimeout(request, 2000 * idx, options, (error, response, body) => {
      const bodyCheck = body.substring(0,12);
      if(bodyCheck === '{"quoteType"') {
        let parsedBody = JSON.parse(body);
        if(parsedBody.quoteType) {
          let parsedBody = JSON.parse(body);
          const newSymbol = new Symbol(parsedBody);
          company.price = newSymbol.price;
          company.pe = newSymbol.pe;
          company.peg = newSymbol.peg;
          company.beta = newSymbol.beta;
          company.pb = newSymbol.pb;
          company.profitMargin = newSymbol.profitMargin;
          company.marketCap = newSymbol.marketCap;
          console.log(company);
          db.updateCompanyData(company);
        }
      }
    })
  });

  let getDataResults = await getData;
  
  getDataResults;

  // console.log(tempArr);
}

//////////////////////////////////////////////////
// function to render home screen
//////////////////////////////////////////////////
function newSearch(req, res) {
  res.render('pages/detail-view');
}

/////////////////////////////////////////////////
// function to search for single ticker
/////////////////////////////////////////////////
function searchSymbol(req, res) {

  superagent.get(`https://apidojo-yahoo-finance-v1.p.rapidapi.com/stock/v2/get-statistics?region=US&symbol=${req.body.symbolField}`)
    .set('x-rapidapi-host', 'apidojo-yahoo-finance-v1.p.rapidapi.com')
    .set('x-rapidapi-key', process.env.RAPID_API_KEY)


    .then( result => {
      const symbol = new Symbol(result.body);
      res.render('index', symbol);
    })
    .catch(err => errorHandler(err, req, res));
}

/////////////////////////////////////////////////////////////////////////
/// not found handler
/////////////////////////////////////////////////////////////////////////
function notFoundHandler(request, response) {
  response.status(404).send('Hmmm... Something went wrong. We couldn\'t find what you are looking for.');
}

/////////////////////////////////////////////////////////////////////////
/// error handler
/////////////////////////////////////////////////////////////////////////
function errorHandler(err, req, res) {
  console.log(err);
  res.status(500).send(err);
}


////////////////////////////////////////////////////////////////////////////
////ABOUT US
////////////////////////////////////////////////////////////////////////////

function information(req, res) {
  res.render('pages/aboutus');
}

function table(req, res){
  res.render('partials/table');
}

exports.newSearch = newSearch;
exports.searchSymbol = searchSymbol;
exports.information = information;
exports.table = table;
exports.notFoundHandler = notFoundHandler;
exports.errorHandler = errorHandler;
exports.updateCompanyData = updateCompanyData;
exports.usersHandler = usersHandler;
exports.updateCoFinData = updateCoFinData;
