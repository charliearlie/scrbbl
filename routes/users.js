const express = require('express');
const router = express.Router();
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

router.post('/scrobble/manual', cors(), function (req, res, next) {
	const track = req.body;
	console.log(track);
	var status = { "success": false };
	var date = Math.floor((new Date()).getTime() / 1000) - 300;
	if (track.datePlayed) {
		var douche = track.datePlayed.slice(0, 10) + track.timePlayed.slice(10)
		date = Number(moment(douche).format('X'));
	}
	console.log(date);
	lastfm.setSessionCredentials(track.userName, track.key); //Horrible hack until I sort sessions with this api
	lastfm.track.scrobble({
		'artist': track.artist,
		'track': track.songTitle,
		'timestamp': date,
		'album': track.albumTitle

	}, function (err, scrobbles) {
		if (err) {
			return console.log('We\'re in trouble', err);
			lastfm.setSessionCredentials(null, null);
			return res.json(status.success);
		}

		console.log('We have just scrobbled:', scrobbles);
		status.success = true;
		lastfm.setSessionCredentials(null, null);
		return res.json(status.success);
	});
});

router.get('/test', cors(), function(req, res, next) {
	res.json({ message: "You can see the message! "});
  });

module.exports = router;
