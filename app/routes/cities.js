// cities.js
// Created by: Matt Bubernak

// Edit History
// Date    Author   Description
// =================================================
// 3/1    MB       File Creation

// Models
var express = require('express');
var mongoose = require("mongoose");
var router = express.Router();
var Schema = mongoose.Schema;

// Define the possible models we could be extracting from the DB.
var City = mongoose.model('City',new Schema(),'cities');

/* GET users listing. */
router.get('/', function(req, res, next) {

  // Request Format:
  // API/Cities/State/Boulder
  var reqObj = {}
  var parts = req.baseUrl.split('/');
  if (parts.length >5) {
    res.send("Invalid request to cities");
  }
  if (parts.length > 3) {
    reqObj["state"] = parts[3];
  }
  if (parts.length > 4) {
    reqObj["name"] = parts[4];
  }

  console.log("API Request for: "  + "city: " + reqObj["city"] + " state: " + reqObj["state"]);
  // Does a "find" on group and returns all groups.
  City.find(reqObj,function (err,cities) {
    res.send(cities)
  })
});

module.exports = router;
