'use strict';

/////////////////////////////////////////////////
// Dependencies
/////////////////////////////////////////////////
const superagent = require('superagent');
const request = require('request');

/////////////////////////////////////////////////
// Constructors
/////////////////////////////////////////////////
function Symbol(data) {
  this.symbol = data.symbol;
  this.price = data.financialData.currentPrice.fmt;
  this.pe = data.summaryDetail.trailingPE.fmt;
  this.pb = data.defaultKeyStatistics.priceToBook.fmt;
  this.peg = data.defaultKeyStatistics.pegRatio.fmt;
  this.profitMargin = data.financialData.profitMargins.fmt;
  this.name = data.quoteType.shortName;
  this.marketCap = data.price.marketCap.fmt;
}

function Company(data) {
  if(data.id) this.id = data.id;
  this.name = data.companyName;
  this.ticker = data.ticker;
  if(data.description) this.description = data.description;
  if(data.industry) this.industry = data.industry;
  if(data.url) this.url = data.url;
}

function updateCompanyData() {
  let returnArr = [];
  
  let options = {
    method: 'GET',
    url: 'https://morningstar1.p.rapidapi.com/companies/list-by-exchange',
    qs: {Mic: 'XNAS'},
    headers: {
      'x-rapidapi-host': 'morningstar1.p.rapidapi.com',
      'x-rapidapi-key': '59c3cee36bmsh6b1f9569817f053p1fe347jsn97c3c9a08030',
      accept: 'json'
    }
  };
  
  request(options, function (error, response, body) {
      if (error) throw new Error(error);
      let parsedBody = JSON.parse(body);
      parsedBody.results.forEach(company => {
        returnArr.push(new Company(company));
      });
      resolve(returnArr);
    });
    reject('firstQuery failure');
  })

  let firstResult = firstQuery;

  let secondQuery = new Promise((resolve, reject) => {
    console.log(returnArr);
    returnArr.forEach(company => {
      options = {
        method: 'GET',
        url: 'https://morningstar1.p.rapidapi.com/companies/get-company-profile',
        qs: {Ticker: `${company.ticker}`, Mic: 'XNAS'},
        headers: {
          'x-rapidapi-host': 'morningstar1.p.rapidapi.com',
          'x-rapidapi-key': '59c3cee36bmsh6b1f9569817f053p1fe347jsn97c3c9a08030',
          accept: 'string'
        }
      };
      
      request(options, function (error, response, body) {
        if (error) throw new Error(error);
        let parsedBody = JSON.parse(body);
        company.description = parsedBody.results.businessDescription.value;
        company.industry = parsedBody.results.industry.value;
        company.url = parsedBody.results.contact.url;
      });
    });
    resolve(returnArr);
    reject('secondQuery failure');
  });
  
  let secondResult = await secondQuery;
  console.log(returnArr);
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
function notFoundHandler(request,response) {
  response.status(404).send('Hmmm... Something went wrong. We couldn\'t find what you are looking for.');
}

/////////////////////////////////////////////////////////////////////////
/// error handler
/////////////////////////////////////////////////////////////////////////
function errorHandler(err, req, res) {
  console.log(err);
  res.status(500).send(err);
}

exports.newSearch = newSearch;
exports.searchSymbol = searchSymbol;
exports.notFoundHandler = notFoundHandler;
exports.errorHandler = errorHandler;
exports.updateCompanyData = updateCompanyData;
