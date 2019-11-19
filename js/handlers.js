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
  this.pe = data.summaryDetail.trailingPE.fmt;
  this.pb = data.defaultKeyStatistics.priceToBook.fmt;
  this.peg = data.defaultKeyStatistics.pegRatio.fmt;
  this.profitMargin = data.financialData.profitMargins.fmt;
  this.name = data.quoteType.shortName;
  this.marketCap = data.price.marketCap.fmt;
}

/////////////////////////////////////////////////
// function to retreive data for home page
/////////////////////////////////////////////////
function renderHome(req, res) {
  res.send('This is the home route');
}
function newSearch(req, res) {
  res.render('pages/detail-view');
}

/////////////////////////////////////////////////
// function to search for single ticker
/////////////////////////////////////////////////
function searchSymbol(req, res) {
  const url = `https://apidojo-yahoo-finance-v1.p.rapidapi.com/stock/v2/get-statistics?region=US&symbol=${req.body.symbolField}`;
  superagent
    .get(url)
    .set("x-rapidapi-host", "apidojo-yahoo-finance-v1.p.rapidapi.com")
    .set("x-rapidapi-key", "19f42967d0msh624bfc050b8998ep18fc02jsn49250de683c9")
    .then(result => {
      // console.log(result)
      const symbol = new Symbol(result.body);
      console.log(symbol);
      res.render("index", symbol);
    });
}

exports.renderHome = renderHome;
exports.newSearch = newSearch;
exports.searchSymbol = searchSymbol;

