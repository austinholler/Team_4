// cities.js
// Created by: Matt Bubernak

// Edit History
// Date    Author   Description
// =================================================
// 3/1    MB        Catches any api failures.

var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.send("ERROR: Invalid API call. API paths are: api/groups, api/events, api/cities")
});

module.exports = router;
