// cities.js
// Created by: Matt Bubernak

// Edit History
// Date    Author   Description
// ==================================================================
// 3/1    MB        Catches any api failures.
// 3/24   MB        Works with Dynamo connections, and all API paths.
// 3/25   MB        Added support for cityList query.

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
  if (parts[2] == "cities") {
    if (parts.length != 5) {
      validQuery = false;
    }
    if (parts.length > 3) {
      reqObj["state"] = parts[3];
    }
    if (parts.length > 4) {
      reqObj["city"] = parts[4];
    }

    // Process the query if it's actually valid.
    if (validQuery) {
      console.log("API Request for: " + "city: " + reqObj["city"] + " state: " + reqObj["state"]);
      dbHandler.get("events", reqObj, function (err, data) {
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
    dbHandler.get("Cities", reqObj, function (err, data) {
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
    res.send("Invalid endpoint. Valid Endpoints: api/cities , api/citylist")
  }

});

module.exports = router;
