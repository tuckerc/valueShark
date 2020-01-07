'use strict';

const handlers = require('./handlers.js');
const db = require('../db/db.js');

/////////////////////////////////////////////////
// function to render login screen
/////////////////////////////////////////////////
function renderLogin(req, res) {
  res.render('pages/login');
}

//////////////////////////////////////////////////////////
// function to handle user login
//////////////////////////////////////////////////////////
function loginHandler(req, res) {
  const userName = req.body.name.toLowerCase();
  db.authUser(userName)
    .then(result => {
      if(result.rowCount) {
        // pull portfolio
        // res.render('index');
        res.redirect('/home?userID=' + result.rows[0].id);
      }
      else {
        // create a user
        db.addUser(userName)
          .then(result => {
            res.redirect('/home?userID=' + result.rows[0].id);
          })
      }
    })
    .catch(err => handlers.errorHandler(err, req, res));
}
