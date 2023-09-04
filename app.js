var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors')
const dbConnection  = require("./dbconnection/db")
const searchRoute = require('./controllers/search_controller');
const customServiceCall = require("./controllers/cronCustomCall")
const news = require("./controllers/news")
const tokenCOntroller = require("./controllers/token_controller")
var app = express();
require('dotenv').config()
const { MORALIS_APIKEY} = process.env;
app.use(cors({ origin: true }));
dbConnection();
// view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/searchApi', searchRoute);
app.use("/customService", customServiceCall)
app.use("/news", news)
app.use("/token", tokenCOntroller)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  // render the error page
  res.status(err.status || 500);
  console.log(err)
  // res.render('error');
});

module.exports = app;
const Moralis = require("moralis").default;
async function startMoralisModule(){
  await Moralis.start({
    apiKey: MORALIS_APIKEY
  });
  console.log("Moralis server is started")
}
startMoralisModule()