// Models
var express = require('express');
var mongoose = require("mongoose");
var router = express.Router();
var Schema = mongoose.Schema;

// Define the possible models we could be extracting from the DB.
var City = mongoose.model('City',new Schema(),'cities');

/* GET users listing. */
router.get('/', function(req, res, next) {

  // Does a "find" on group and returns all groups.
  City.find(function (err,cities) {
    res.send(cities)
  })
});

module.exports = router;
