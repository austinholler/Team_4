// groups.js
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

// Define the model for what we are pulling out of the DB.
var Group = mongoose.model('Group',new Schema(),'groups');

/* GET users listing. */
router.get('/', function(req, res, next) {

  // Does a "find" on group and returns all groups.
  Group.find(function (err,groups) {
    res.send(groups)
  })
});

module.exports = router;
