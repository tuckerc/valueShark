'use strict';

/////////////////////////////////////////////////
// Dependencies
/////////////////////////////////////////////////
const superagent = require('superagent');
const request = require('request');
const uuidv5 = require('uuid/v5');
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

function User(name, id) {
  this.name = name;
  this.id = id;
}


//////////////////////////////////////////////////////////
// function to handle user login
//////////////////////////////////////////////////////////
function loginHandler(req, res) {
  const userName = req.body.name.toLowerCase();
  const namespace = '1b671a64-40d5-491e-99b0-da01ff1f3341';
  const userID = uuidv5(userName, namespace);

  const user = new User(userName.toLowerCase(), userID);

  db.authUser(user)
    .then(result => {
      if(result.rowCount) {
        res.redirect('/home?userID=' + user.id);
      }
      else {
        // create a user
        db.addUser(user)
          .then(result => {
            res.redirect('/home?userID=' + user.id);
          })
      }
    })
    .catch(err => errorHandler(err, req, res));
}

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
        const bodyCheck = body.substring(0, 9);
        if (bodyCheck === '{"result"') {
          let parsedBody = JSON.parse(body);
          if(parsedBody.result) {
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
        'x-rapidapi-key': '59c3cee36bmsh6b1f9569817f053p1fe347jsn97c3c9a08030'
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

/////////////////////////////////////////////////
// function to render login screen
/////////////////////////////////////////////////
function renderLogin(req, res) {
  res.render('pages/login');
}

//////////////////////////////////////////////////
// function to render home screen
//////////////////////////////////////////////////
async function pullData(req, res) {
  
  let results = {};
  
  const getPortfolioQuery = db.getPortfolio(req.query.userID)
    .then(result => {
      results.portfolio = result.rows;
    })
    .catch(err => errorHandler(err, req, res));

  const getPortfolioResult = await getPortfolioQuery;
  getPortfolioResult;

  console.log('after first await: ', results);

  const getTableData = db.getTable()
      .then(result => {
        results.table = result.rows;
      })
      .catch(err => errorHandler(err, req, res));

  const getTableDataResult = await getTableData;
  getTableDataResult;

  console.log('after second await ', results);

  const render = new Promise((resolve, reject) => {
    console.log('last before render ', results);
    res.render('index', results);
    resolve('render');
    reject('no render');
  });
  
  const renderResult = await render;
  renderResult;

}

/////////////////////////////////////////////////////
// function for rendering the portfolio update page
/////////////////////////////////////////////////////
function renderPortfolioUpdate(req, res) {
  res.render('pages/portfolio-edit');
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
      res.render('pages/search', symbol);
    })
    .catch(err => errorHandler(err, req, res));
}

////////////////////////////////////////////////////////////////////////
// function for adding a company to a portfolio
////////////////////////////////////////////////////////////////////////
function addPortfolio(req, res) {
  console.log(req);
  db.addPortfolio(req.body.userID, req.body.coID)
    .then(result => {
      console.log(result.rows);
    })
}

////////////////////////////////////////////////////////
// function for deleting a company from user portfolio
////////////////////////////////////////////////////////
function deletePortfolio(req, res) {
 console.log(req);
 db.deletePortfolio(req.body.userID, req.body.coID)
  .then(result => {
    console.log(result.rows);
  }) 
}

////////////////////////////////////////////////////////////////////////
// function for updating a company in a portfolio
////////////////////////////////////////////////////////////////////////
function updatePortfolio(req, res) {
  console.log(req);
  db.addPortfolio(req.body.userID, req.body.coID, req.body.shares, req.body.avgCost)
    .then(result => {
      console.log(result.rows);
    })
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



exports.pullData = pullData;
exports.searchSymbol = searchSymbol;
exports.information = information;
exports.notFoundHandler = notFoundHandler;
exports.errorHandler = errorHandler;
exports.updateCompanyData = updateCompanyData;
exports.loginHandler = loginHandler;
exports.updateCoFinData = updateCoFinData;
exports.addPortfolio = addPortfolio;
exports.updatePortfolio = updatePortfolio;
exports.renderPortfolioUpdate = renderPortfolioUpdate;
exports.deletePortfolio = deletePortfolio;
exports.renderLogin = renderLogin;
