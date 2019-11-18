'use strict';

/////////////////////////////////////////////////
// Dependencies
/////////////////////////////////////////////////
const superagent = require('superagent');

/////////////////////////////////////////////////
// Constructors
/////////////////////////////////////////////////
function Symbol(data) {
  this.symbol = data.symbol;
  this.price = data.financialData.currentPrice;
  this.pe = data.summaryDetail.trailingPE;
  this.pb = data.defaultKeyStatistics.priceToBook;
  this.peg = data.defaultKeyStatistics.pegRatio;
  this.profitMargin = data.financialData.profitMargins;
  this.name = data.quoteType.shortName;
  this.marketCap = data.price.marketCap;
}

/////////////////////////////////////////////////
// function to retreive data for home page
/////////////////////////////////////////////////
function renderHome(req, res) {
  res.send();
}

/////////////////////////////////////////////////
// function to search for single ticker
/////////////////////////////////////////////////
function searchSymbol(req, res) {
  superagent.get('https://apidojo-yahoo-finance-v1.p.rapidapi.com/stock/v2/get-statistics?region=US&symbol=S')
    .set('x-rapidapi-host', 'apidojo-yahoo-finance-v1.p.rapidapi.com')
    .set('x-rapidapi-key', '59c3cee36bmsh6b1f9569817f053p1fe347jsn97c3c9a08030')
    .then( result => {
      const symbol = new Symbol(result.body);
      res.render('index',symbol);
    });
}

exports.renderHome = renderHome;
exports.searchSymbol = searchSymbol;
