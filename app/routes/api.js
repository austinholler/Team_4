// cities.js
// Created by: Matt Bubernak

// Edit History
// Date    Author   Description
// ==================================================================
// 3/1    MB        Catches any api failures.
// 3/24   MB        Works with Dynamo connections, and all API paths.
// 3/25   MB        Added support for cityList query.
// 3/27   MB        API now supports topics instead of cities query.
// 4/2    MB        Supports more robust city query.
// 4/3    MB        Fixed error message to reference correct api path
// 4/9    MB        Support for new category/topic queries.

var express = require('express');
var router = express.Router();


/* GET home page. */
router.get('/', function(req, res, next) {
  console.log('reached api');

  // Boolean indicating whether the query should be processed.
  var validQuery = true;

  // get access to dbHandler and cacheHandler
  var dbHandler = req.app.get('dbHandler');
  var cacheHandler = req.app.get('cacheHandler');

  // This contains all of the parameters from the api request.
  var reqObj = {}

  // Split the url to determine all the parts.
  var parts = req.baseUrl.split('/');

  console.log('parts:' + parts);

  // Query for a city topics
  if (parts[2] == "topics") {
    if (parts.length != 5 && parts.length != 7) {
      validQuery = false;
    }
    var recCode = parts[3];
    reqObj["Topic"] = parts[4];
    reqObj["code"] = recCode;
    if (parts.length == 7)
    {

      reqObj["start"] = recCode + parts[5];
      reqObj["end"] = recCode + parts[6];
    }

    // Process the query if it's actually valid.
    if (validQuery) {
      console.log("API Request for: " + "city: " + recCode);
      console.log(reqObj);
      dbHandler.get("Topics", reqObj, function (err, data) {
        if (err) {
          res.send("Query Fialed")
        }
        else {
          console.log('got the data back');
          res.send(data)
        }
      })
    }
    else {
      res.send("Invalid request to api.");
    }
  }

  // Query for a city category
  else if (parts[2] == "categories") {
    if (parts.length != 5 && parts.length != 7) {
      validQuery = false;
    }
    var recCode = parts[3];
    reqObj["Category"] = parts[4];
    reqObj["code"] = recCode;
    if (parts.length == 7)
    {

      reqObj["start"] = recCode + parts[5];
      reqObj["end"] = recCode + parts[6];
    }

    // Process the query if it's actually valid.
    if (validQuery) {
      console.log("API Request for: " + "city: " + recCode);
      console.log(reqObj);
      dbHandler.get("Topics", reqObj, function (err, data) {
        if (err) {
          res.send("Query Fialed")
        }
        else {
          console.log('got the data back');
          res.send(data)
        }
      })
    }
    else {
      res.send("Invalid request to api.");
    }
  }

  // Query for city list
  else if (parts[2] == "citylist") {
    console.log("API Request for city list");
    if (parts.length > 3) {
      reqObj["code"] = parts[3];
    }
    dbHandler.get("Cities", reqObj, function (err, data) {
        if (err) {
          res.send("Query Fialed")
        }
        else {
          res.send(data)
        }
      })

  }

  // Query for cached data for city
  else if (parts[2] == "cache") {
    console.log("API Request for cache");
    if (parts.length > 3) {
      reqObj["code"] = parts[3];
    }
    cacheHandler.getCacheEntry(reqObj["code"], function (err, data) {
      if (err) {
        res.send("Cache Lookup Fialed")
      }
      else {
        res.send(data)
      }
    })

  }

  else {
    res.send("Invalid endpoint. Valid Endpoints: api/topics , api/citylist, api/categories, api/cache/[cityCode]");
      }
});

module.exports = router;
