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
  this.price = data.financialData.currentPrice.fmt;
  this.pe = data.summaryDetail.trailingPE.fmt;
  this.pb = data.defaultKeyStatistics.priceToBook.fmt;
  this.peg = data.defaultKeyStatistics.pegRatio.fmt;
  this.profitMargin = data.financialData.profitMargins.fmt;
  this.name = data.quoteType.shortName;
  this.marketCap = data.price.marketCap.fmt;
}

function newSearch(req, res) {
  res.render('pages/detail-view');
}

/////////////////////////////////////////////////
// function to search for single ticker
/////////////////////////////////////////////////
function searchSymbol(req, res) {
<<<<<<< HEAD
  const url = `https://apidojo-yahoo-finance-v1.p.rapidapi.com/stock/v2/get-statistics?region=US&symbol=${req.body.symbolField}`;
  superagent
    .get(url)
    .set('x-rapidapi-host', 'apidojo-yahoo-finance-v1.p.rapidapi.com')
    .set('x-rapidapi-key', 'RAPID_API_KEY')
    .then(result => {
      // console.log(result)
      const symbol = new Symbol(result.body);
      console.log(symbol);
      res.render('index', symbol);
    });
=======
  superagent.get(`https://apidojo-yahoo-finance-v1.p.rapidapi.com/stock/v2/get-statistics?region=US&symbol=${req.body.symbolField}`)
    .set('x-rapidapi-host', 'apidojo-yahoo-finance-v1.p.rapidapi.com')
    .set('x-rapidapi-key', process.env.RAPID_API_KEY)
    .then( result => {
      const symbol = new Symbol(result.body);
      console.log(symbol);
      res.render("index", symbol);
    })
    .catch(err => console.log(err));
>>>>>>> 1abb5ee7471072fb208b467f416297997a12bfaa
}

exports.newSearch = newSearch;
exports.searchSymbol = searchSymbol;
