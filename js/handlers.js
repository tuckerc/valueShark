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
        // pull portfolio
        // res.render('index');
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
  try {
    db.deleteCompanies();
    let returnArr = [];
    const coList = await _getCoList(returnArr);
    coList;
    const coInfo = await _getCoInfo(returnArr);
    coInfo;
    console.log(`companies table updated: ${Math.floor(Date.now() / 1000)}`);
  }
  catch(err) {
    console.log(err);
  }
}

////////////////////////////////////////////////////
// helper to get company list
////////////////////////////////////////////////////
function _getCoList(arr) {
  return new Promise((resolve, reject) => {
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
      try {
        let parsedBody = JSON.parse(body);
        parsedBody.results.forEach(company => {
          arr.push(new Company(company));
        });
        resolve(arr);
      }
      catch(err) {
        console.log(err);
        reject(err);
      }
    });
  });
}

//////////////////////////////////////////////////
// helper to get company info
//////////////////////////////////////////////////
function _getCoInfo(arr) {
  return new Promise((resolve, reject) => {
    arr.forEach((company, idx) => {
      const options = {
        method: 'GET',
        url: `https://sandbox.iexapis.com/v1/stock/${company.ticker}/company`,
        qs: { token: `${process.env.IEX_PUBLIC}` },
        headers: {
          sk: `${process.env.IEX_SECRET}`
        }
      };
      
      setTimeout(request, 250 * idx, options, (error, response, body) => {
        try {
          let parsedBody = JSON.parse(body);
          company.description = parsedBody.description;
          company.industry = parsedBody.industry;
          company.url = parsedBody.website;
          console.log(idx);
          console.log(company);
          db.addCompany(company);
        }
        catch(err) {
          console.log(err);
          reject(err);
        }        
      });
    });
    resolve(arr);
  });
}

//////////////////////////////////////////////////
// function to update the financial data
// for every company in the database
//////////////////////////////////////////////////
async function updateCoFinData() {
  let tempArr = [];
  
  const tickers = await _getTickers(tempArr);
  tickers;
  const data = await _getCoData(tempArr);
  data;
}

/////////////////////////////////////////////////
// helper to get ticker symbols
////////////////////////////////////////////////
function _getTickers(arr) {
  return new Promise((resolve, reject) => {
    try {
      db.getCompanies()
        .then(result => {
          result.rows.forEach(company => {
            arr.push(new Company(company));
          });
          resolve(arr);
        })
        .catch(err => console.log(err));
    }
    catch(err) {
      console.log(err);
      reject(err);
    }
  });
}

/////////////////////////////////////////////////
// Helper function for updating company price
/////////////////////////////////////////////////
function _getCoData(arr) {
  return new Promise((resolve, reject) => {
    try {
      arr.forEach((company, idx) => {
        let options = {
          method: 'GET',
          url: `https://sandbox.iexapis.com/v1/stock/${company.ticker}/quote/latestPrice`,
          qs: { token: `${process.env.IEX_PUBLIC}` },
          headers: {
            sk: `${process.env.IEX_SECRET}`
          }
        };
        
        setTimeout(request, 25 * idx, options, (error, response, body) => {
          try {
            let parsedBody = JSON.parse(body);
            company.price = parsedBody;
            console.log(company);
          }
          catch(err) {
            console.log(err);
          }
        });
    
        options = {
          method: 'GET',
          url: `https://sandbox.iexapis.com/v1/stock/${company.ticker}/advanced-stats`,
          qs: { token: `${process.env.IEX_PUBLIC}` },
          headers: {
            sk: `${process.env.IEX_SECRET}`
          }
        };
        
        setTimeout(request, 25 * idx, options, (error, response, body) => {
          try {
            let parsedBody = JSON.parse(body);
            company.pe = parsedBody.peRatio;
            company.peg = parsedBody.pegRatio;
            company.beta = parsedBody.beta;
            company.pb = parsedBody.priceToBook;
            company.profitMargin = parsedBody.profitMargin;
            company.marketCap = parsedBody.marketcap;
            console.log(company);
          }
          catch(err) {
            console.log(err);
          }
        });
        setTimeout(db.updateCompanyData, 100 * idx, company);
      });
      resolve(arr);
    }
    catch(err) {
      console.log(err);
      reject(err);
    };
  });
}

/////////////////////////////////////////////////
// helper for updating company data in db
/////////////////////////////////////////////////
// async function _coDataUpdate(arr) {
//   return new Promise((resolve, reject) => {
//     try {
//       arr.forEach((company, idx) => {
//         console.log(company);
        
//       });
//       resolve(arr);
//     }
//     catch(err) {
//       console.log(err);
//       reject(err);
//     }
//   });
// }

/////////////////////////////////////////////////
// function to render login screen
/////////////////////////////////////////////////
function renderLogin(req, res) {
  res.render('pages/login');
}

//////////////////////////////////////////////////
// function to pull data for portfolio and table
//////////////////////////////////////////////////
async function pullData(userID) {
  
  let results = {};
  
  const getPortfolioQuery = db.getPortfolio(userID)
    .then(result => {
      results.portfolio = result.rows;
    })
    .catch(err => errorHandler(err));

  const getPortfolioResult = await getPortfolioQuery;
  getPortfolioResult;

  const getTableData = db.getTable()
      .then(result => {
        results.table = result.rows;
      })
      .catch(err => errorHandler(err));

  const getTableDataResult = await getTableData;
  getTableDataResult;

  return results;
}

/////////////////////////////////////////////////////////////
// function to render search view
/////////////////////////////////////////////////////////////
async function indexRender(req,res) {
  let results = {};

  // get portfolio and table data
  const query = await pullData(req.query.userID);
  const result = query;
  result;
  results.portfolio = result.portfolio;
  results.table = result.table;

  // console.log(results);

  res.render('index', results);
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
async function searchSymbol(ticker) {
  let symbol = {};

  const tickerQuery = await superagent.get(`https://apidojo-yahoo-finance-v1.p.rapidapi.com/stock/v2/get-statistics?region=US&symbol=${ticker}`)
    .set('x-rapidapi-host', 'apidojo-yahoo-finance-v1.p.rapidapi.com')
    .set('x-rapidapi-key', '59c3cee36bmsh6b1f9569817f053p1fe347jsn97c3c9a08030')
    .then( result => {
      symbol = new Symbol(result.body);
    })
    .catch(err => errorHandler(err));

  const tickerResult = tickerQuery;
  tickerResult;

  return symbol;
}

/////////////////////////////////////////////////////////////
// function to render search view
/////////////////////////////////////////////////////////////
async function searchRender(req,res) {
  let results = {};

  // get search results
  const searchQuery = await searchSymbol(req.body.symbolField);
  results.symbol = searchQuery;
  results.symbol.userID = req.body.userID;

  // get portfolio data
  const getPortfolioQuery = await db.getPortfolio(req.body.userID)
    .then(result => {
      results.portfolio = result.rows;
    })
    .catch(err => errorHandler(err));

  const getPortfolioResult = getPortfolioQuery;
  getPortfolioResult;

  res.render('pages/search', results);
}

////////////////////////////////////////////////////////////////////////
// function for adding a company to a portfolio
////////////////////////////////////////////////////////////////////////
function addPortfolio(req, res) {
  db.addNewStock(req.body.userID, req.body.ticker)
    .then(result => {
      // console.log(result.rows);
      res.render('/home' + req.body.userID);
    })
    .catch(err => (err, res, req));
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
////////////////////////////////////////////////////////
// function for getting table
////////////////////////////////////////////////////////
function getTable(req, res) {
  // console.log(req);
  db.getTable(req,res)
  .then(result =>{
    // console.log(result);
    res.render('index', {tableResults: result.rows})
  })
  .catch(err => console.log(err))
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
exports.getTable = getTable;
exports.renderLogin = renderLogin;
exports.searchRender = searchRender;
exports.indexRender = indexRender;