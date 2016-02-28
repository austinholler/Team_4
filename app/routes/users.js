var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  mongoose.connect('mongodb://localhost/MeetupPulse');
  res.send('respond with users');
});

module.exports = router;
