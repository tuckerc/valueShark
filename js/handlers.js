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
async function renderHome(req, res) {
  const index = ['MMM', 'AXP', 'AAPL', 'BA', 'CAT', 'CVX', 'CSCO', 'KO', 'DIS', 'DOW', 'XOM', 'GS', 'HD', 'IBM', 'INTC', 'JNJ', 'JPM', 'MCD', 'MSFT', 'MRK', 'NKE', 'PFE', 'PG', 'TRV', 'UTX', 'UNH', 'VZ', 'V', 'WMT', 'WBA'];
  const returnArr = [];
  await index.forEach(ticker => {
    console.log(ticker);
    superagent.get(`https://apidojo-yahoo-finance-v1.p.rapidapi.com/stock/v2/get-statistics?region=US&symbol=${String(ticker)}`)
      .set('x-rapidapi-host', 'apidojo-yahoo-finance-v1.p.rapidapi.com')
      .set('x-rapidapi-key', process.env.RAPID_API_KEY)
      .then( result => {
        const symbol = new Symbol(result.body);
        console.log(symbol);
        returnArr.push(symbol);
      })
      .catch(err => console.log(err));
  });
  console.log(returnArr);
  res.send(returnArr);
}

/////////////////////////////////////////////////
// function to search for single ticker
/////////////////////////////////////////////////
function searchSymbol(req, res) {
  superagent.get('https://apidojo-yahoo-finance-v1.p.rapidapi.com/stock/v2/get-statistics?region=US&symbol=exel')
    .set('x-rapidapi-host', 'apidojo-yahoo-finance-v1.p.rapidapi.com')
    .set('x-rapidapi-key', process.env.RAPID_API_KEY)
    .then( result => {
      const symbol = new Symbol(result.body);
      res.send(symbol);
    });
}

exports.renderHome = renderHome;
exports.searchSymbol = searchSymbol;
