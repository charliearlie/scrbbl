var express = require('express');
var router = express.Router();
const path = require('path');

/* GET home page. */
router.get('*', function(req, res) {
  res.sendFile('client/build/scrbbl', { root: global });
});

module.exports = router;
