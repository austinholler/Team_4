// App.js
// Created by: Matt Bubernak

// Edit History
// Date    Author   Description
// =================================================
// 2/28    MB       Mongo Support
// 3/1     MB       CORS Support + Additional Routes
// 312     MB       Dynamo Support
// 3/22    MB       Routing for index fix

// Const
const region = "us-west-2";
const dbLocation = "http://localhost:8000";

// Modules
//var mongoose = require("mongoose");
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var cors = require("cors");
var routes = require('./routes/index');
var events = require('./routes/events');
var groups = require('./routes/groups');
var cities = require('./routes/cities');
var api = require('./routes/api');
var dbHandler = require("./dbHandler")



// Application
var app = express();

// DB Connection
dbHandler.connect(region,dbLocation);
//dbHandler.deleteTable("events");
//dbHandler.createTable("events");
dbHandler.put("events");
dbHandler.get("events");

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/*', routes);
app.use('/api/events*', events);
app.use('/api/groups*', groups);
app.use('/api/cities*', cities);
app.use('/api*', api);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;

// Needed for running on ec2
app.listen(80);