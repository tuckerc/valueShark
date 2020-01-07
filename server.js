'use strict';

//////////////////////////////////////////////////
// Configs
//////////////////////////////////////////////////
require('dotenv').config();

////////////////////////////////////////////////
// Dependencies
////////////////////////////////////////////////
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const schedule = require('node-schedule');
const handlers = require('./js/handlers.js');
const login = require('./js/login.js');
// const pg = require('pg')

////////////////////////////////////////////////
// Application Configuration
////////////////////////////////////////////////
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
const PORT = process.env.PORT || 3000;
app.set('view engine', 'ejs');

////////////////////////////////////////////////
// Routes
////////////////////////////////////////////////
app.use(express.static('./public'));

// route for Home-Page
app.get('/', login.renderLogin);
app.post('/', login.loginHandler);
app.get('/home', handlers.indexRender);
app.post('/search', handlers.searchRender);
app.get('/about', handlers.information);
app.post('/addPortfolio', handlers.addPortfolio);
app.get('/updatePortfolio', handlers.renderPortfolioUpdate);
app.put('/updatePortfolio', handlers.updatePortfolio);
app.get('/deletePortfolio', handlers.deletePortfolio);
app.use('*', handlers.notFoundHandler);
app.use(handlers.errorHandler);


////////////////////////////////////////////////
// Initiation
////////////////////////////////////////////////
app.listen(PORT, () => {
  console.log(`listening on http://localhost:${PORT}`);
});

// update company data every month on the first day at midnight
schedule.scheduleJob('* * 0 1 * *', handlers.updateCompanyData);

schedule.scheduleJob('* * 0 * * *', handlers.updateCoFinData);

// handlers.updateCompanyData();

handlers.updateCoFinData();
