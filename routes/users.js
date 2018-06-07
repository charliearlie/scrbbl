const express = require('express');
const router = express.Router();
const lastfm = require('./lastfm');
const cors = require('cors');

/* GET users listing. */
router.get('/session/:token', cors(), function(req, res, next) {
  if (req.params.token != 'undefined') {
		lastfm.authenticate(req.params.token, function (error, sess) {
			if (error) throw console.log(error);
			session = sess;
			return res.json(session);
		});
	}
});

module.exports = router;
