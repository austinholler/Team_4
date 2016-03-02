// cities.js
// Created by: Matt Bubernak

// Edit History
// Date    Author   Description
// =================================================
// 3/1    MB        Updated to redirect to index.html

var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.sendfile('public/index.html')
});

module.exports = router;
