const express = require('express');
const router = express.Router();
const scrobbleController = require('../controllers/scrobbleController');
const lastfm = require('./lastfm');
const cors = require('cors');

/* GET users listing. */
router.get('/users/session/:token', cors(), function(req, res, next) {
  if (req.params.token != 'undefined') {
		lastfm.authenticate(req.params.token, function (error, sess) {
			if (error) throw console.log(error);
			session = sess;
			return res.json(session);
		});
	}
});

router.post('/scrobble/manual', scrobbleController.manualScrobble);

module.exports = router;
