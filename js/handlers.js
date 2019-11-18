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
      'x-rapidapi-key': '59c3cee36bmsh6b1f9569817f053p1fe347jsn97c3c9a08030'
    }
  })
    .then(data => {

      console.log('DATAAAA', data);
      res.status(200).send('HELLO');
    })
    .catch(err => {
      console.log(err);
    });
}

exports.renderHome = renderHome;
exports.searchSymbol = searchSymbol;
