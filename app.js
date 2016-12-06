'use strict'

// dependencies
const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
const flash = require('connect-flash');
const csrf = require('csurf');
const app = express();

// configuration
const configDB = require(path.join(__dirname, 'config', 'database'));
mongoose.connect(configDB.url, function(err, res) {
  if(err) {
    console.log('ERROR: No fue posible conectarse a la base de datos. ' + err);
    throw err;
  }
});

require(path.join(__dirname, 'config', 'passport'))(passport);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// required for passport
app.use(session({
  secret: process.env.SESSION_SECRET || 'thesecretisnotsecret',
  saveUninitialized: false,
  resave: false,
  duration: 30 * 60 * 1000,
  activeDuration: 5 * 60 * 1000,
  httpOnly: true, // no deja a javascript acceder a las cookies
  secure: true, // cookies solo en https
  ephemeral: true, // destruye cookies cuando el browser cierra
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

//Initiate CSRF on middleware
app.use(csrf());

// Get port from environment and store in Express.
const port = normalizePort(process.env.PORT || '3000');
app.set('port', port);
const ssl_port = normalizePort(process.env.SSL_PORT || '3443');
app.set('ssl_port', ssl_port);

// import routes
app.all('*', function(req, res, next) {
  if(req.secure) {
    return next();
  };
  res.redirect('https://' + req.host + ':' + ssl_port + req.url);
});
require(path.join(__dirname, 'routes', 'index'))(app);
require(path.join(__dirname, 'routes', 'auth'))(app, passport);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  let err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});



/**
 * Normalize a port into a number, string, or false.
 */
function normalizePort(val) {
  let port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

module.exports = app;
