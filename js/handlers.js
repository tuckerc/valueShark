'use strict';

/////////////////////////////////////////////////
// Dependencies
/////////////////////////////////////////////////
const fetch = require('node-fetch');

/////////////////////////////////////////////////
// Constructors
/////////////////////////////////////////////////
function Symbol(data) {
  this.symbol = data.symbol;
  this.price = data.financialData.currentPrice;
  this.pe = data.summaryDetail.trailingPE;
  this.pb = data.defaultKeyStatistics.priceToBook;
  this.peg = data.defaultKeyStatistics.pegRatio.fmt;
  this.profitMargin = data.financialData.profitMargins.fmt;
  this.name = data.quoteType.shortName;
  this.marketCap = data.price.marketCap;
}

/////////////////////////////////////////////////
// function to retreive data for home page
/////////////////////////////////////////////////
function renderHome(req, res) {
  res.send('POL');
}

/////////////////////////////////////////////////
// function to search for single ticker
/////////////////////////////////////////////////
function searchSymbol(req, res) {
  fetch('https://apidojo-yahoo-finance-v1.p.rapidapi.com/stock/v2/get-statistics?region=US&symbol=amzn', {
    'method': 'GET',
    'headers': {
      'x-rapidapi-host': 'apidojo-yahoo-finance-v1.p.rapidapi.com',
      'x-rapidapi-key': 'DATABASE_API'
    }
  })
    .then(result => {
      console.log(result.body);
    })
    .catch(err => {
      console.log(err);
    });
}

exports.renderHome = renderHome;
exports.searchSymbol = searchSymbol;
