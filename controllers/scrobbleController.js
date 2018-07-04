const lastfm = require('../routes/lastfm');

exports.manualScrobble = (req, res) => {
    const track = req.body;
	const status = { "success": false };
    let date = Math.floor((new Date()).getTime() / 1000) - 300;
    
	if (track.datePlayed) {
		let douche = track.datePlayed.slice(0, 10) + track.timePlayed.slice(10)
		date = Number(moment(douche).format('X'));
    }
    
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
}

exports.get = (req, res) => {
    res.json({ name: 'Facking egg'});
}