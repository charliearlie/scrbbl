const express = require('express');
const router = express.Router();
const scrobbleController = require('../controllers/scrobbleController');
const appleMusicController = require('../controllers/appleMusicController');
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

/**
 * Apple Music endpoints
 */
router.get('/appleMusic/album/details/:albumId', appleMusicController.getAlbumDetails);
router.get('/appleMusic/search', appleMusicController.search);

/** 
 * Scrobble endpoints
 */
router.post('/scrobble/manual', scrobbleController.manualScrobble);
router.post('/scrobble/album', scrobbleController.albumScrobble);

module.exports = router;
