var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
  res.render('index', { title: 'Passport Image Manager' });
});

module.exports = router;
