const lastfm = require('../routes/lastfm');
const _ = require('lodash');
const moment = require('moment');

exports.manualScrobble = (req, res) => {
    const track = req.body;
	const status = { "success": false };
    let date = Math.floor((new Date()).getTime() / 1000) - 300;
	
	// I wrote this on a previous scrobbler when I first started programming. 
	// Honestly don't even know what's happening
	if (track.date) {
		const dateSplit = track.date.split('-');
		let formattedDate;
		if (track.time) {
			const splitTime = track.time.split(":");
			formattedDate = moment().set({ 
				day: dateSplit[2] - 1, 
				month: dateSplit[1] - 1, 
				year: dateSplit[0],
				hour: splitTime[0],
				minute: splitTime[1],
			}).format('X');
		} else {
			formattedDate = moment().set({ 
				day: dateSplit[2] - 1, 
				month: dateSplit[1] - 1, 
				year: dateSplit[0],
			}).format('X');
		}
		date = formattedDate;
	}
    
	lastfm.setSessionCredentials(track.userName, track.key); //Horrible hack until I sort sessions with this api
	console.log(lastfm);
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
		status.success = true;
		lastfm.setSessionCredentials(null, null);
		return res.json(status.success);
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