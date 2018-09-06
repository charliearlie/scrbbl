const _ = require('lodash');
const moment = require('moment');
const mongoose = require('mongoose');
const Scrobble = mongoose.model('Scrobble');
const lastfm = require('../routes/lastfm');

exports.manualScrobble = (req, res) => {
    const track = req.body;
    let date = Math.floor((new Date()).getTime() / 1000) - 300;

	track.timestamp = date;
    
	lastfm.setSessionCredentials(track.user, track.key); //Horrible hack until I sort sessions with this api
	lastfm.track.scrobble({
		'artist': track.artist,
		'album': track.album,
		'albumArtist': track.albumArtist,
		'timestamp': track.timestamp,
		'track': track.track,
	}, function (err, scrobbles) {
		if (err) {
			lastfm.setSessionCredentials(null, null);
			return res.json(false);
		}

		const scrobble = new Scrobble(track);
		scrobble
			.save()
			.then(() => res.json(scrobbles)) // This will return the number of times the user has scrobbled the track
			.catch(err => { throw Error(err) });
	});
};

exports.albumScrobble = (req, res) => {
	const user = {
		username: req.headers.username,
		key: req.headers.key
	};
	let time = Math.floor((new Date()).getTime() / 1000) - 300;
	const album = req.body;


	lastfm.setSessionCredentials(user.username, user.key); //Horrible hack again

	_.forEachRight(album, (track) => {
		time = time -= Number(track.trackTime / 1000);

		lastfm.track.scrobble({
			'artist': track.artist,
			'track': track.songTitle,
			'timestamp': time,
			'album': track.albumTitle

		}, function (err, scrobbles) {
			if (err) {
				return console.log('We\'re in trouble', err);
				lastfm.setSessionCredentials(null, null);
				return res.json(status.success);
			}
			console.log('we did it');
			return res.json(status.success);
		});
	});
	lastfm.setSessionCredentials(null, null);
}

function scrobbleAlbum(tracks) {
	var success = false;
	
	
}