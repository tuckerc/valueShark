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
  this.price = data.financialData.currentPrice;
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

async function updateCompanyData() {
  let returnArr = [];
  
  let firstQuery = new Promise((resolve, reject) => {
    const options = {
      method: 'GET',
      url: 'https://morningstar1.p.rapidapi.com/companies/list-by-exchange',
      qs: {Mic: 'XNAS'},
      headers: {
        'x-rapidapi-host': 'morningstar1.p.rapidapi.com',
        'x-rapidapi-key': process.env.RAPID_API_KEY,
        accept: 'json'
      }
    };
  
    request(options, function (error, response, body) {
      if (error) throw new Error(error);
      let parsedBody = JSON.parse(body);
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
    returnArr.forEach(company => {
      setTimeout(() => {
        const options = {
          method: 'GET',
          url: 'https://morningstar1.p.rapidapi.com/companies/get-company-profile',
          qs: {Ticker: `${company.ticker}`, Mic: 'XNAS'},
          headers: {
            'x-rapidapi-host': 'morningstar1.p.rapidapi.com',
            'x-rapidapi-key': process.env.RAPID_API_KEY,
            accept: 'string'
          }
        };
        
        request(options, function (error, response, body) {
          if (error) throw new Error(error);
          const textBody = JSON.stringify(body);
          let parsedBody = JSON.parse(textBody);
          if(parsedBody.result) {
            company.description = parsedBody.result.businessDescription.value;
            company.industry = parsedBody.result.industry.value;
            company.url = parsedBody.result.contact.url;
          }
        });
      },10000);
    });
    resolve('good second query');
    reject('bad second query');
  });

  let secondResult = await secondQuery;

  secondResult;
  return returnArr;
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

//////////////////////////////////////////////////
/////// ABOUT US FUNCTION
//////////////////////////////////////////////////
function information(req, res) {
  res.render('pages/aboutus');
}
exports.newSearch = newSearch;
exports.searchSymbol = searchSymbol;
exports.information = information;

