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

var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log('reached api');

  // Boolean indicating whether the query should be processed.
  var validQuery = true;

  // get access to dbHandler
  var dbHandler = req.app.get('dbHandler');

  // This contains all of the parameters from the api request.
  var reqObj = {}

  // Split the url to determine all the parts.
  var parts = req.baseUrl.split('/');

  console.log('parts:' + parts);

  // Query for a city
  if (parts[2] == "topics") {
    if (parts.length != 4) {
      validQuery = false;
    }
    reqObj["code"] = parts[3];

    // Process the query if it's actually valid.
    if (validQuery) {
      console.log("API Request for: " + "city: " + reqObj["city"] + " state: " + reqObj["state"]);
      dbHandler.get("topics_" + reqObj["code"], {}, function (err, data) {
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
  else {
    res.send("Invalid endpoint. Valid Endpoints: api/cities , api/citylist");
      }
});

module.exports = router;
