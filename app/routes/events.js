// Models
var express = require('express');
var mongoose = require("mongoose");
var router = express.Router();
var Schema = mongoose.Schema;

// Define the model for what we are pulling out of the DB.
var Event = mongoose.model('Event',new Schema(),'events');

/* GET users listing. */
router.get('/', function(req, res, next) {

  // Does a "find" on group and returns all groups.
  Event.find(function (err,events) {
    res.send(events)
  })
});

module.exports = router;
