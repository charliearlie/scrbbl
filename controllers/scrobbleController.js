const _ = require('lodash');
const moment = require('moment');
const mongoose = require('mongoose');
const Scrobble = mongoose.model('Scrobble');
const AlbumScrobble = mongoose.model('AlbumScrobble');
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
	const tracks = req.body.tracks;
	const album = req.body.albumInfo;
	album.timestamp = time;

	lastfm.setSessionCredentials(user.username, user.key); //Horrible hack again

	_.forEachRight(tracks, (track) => {
		time = time -= Number(track.trackTime / 1000);

		lastfm.track.scrobble({
			'artist': track.artist,
			'track': track.songTitle,
			'timestamp': time,
			'album': album.album

		}, function (err, scrobbles) {
			if (err) {
				return res.json(err);
			}
			console.log('we did it');
		});
	});

	const ret = {
		albumScrobbles: 0,
		artistScrobbles: 0,
	};

	const albumScrobble = new AlbumScrobble({...album, user: user.username});
	albumScrobble
		.save()
		.then(async () => {
			ret.albumScrobbles = await AlbumScrobble.count({ album: album.album, user: user.username}) || 0;
			ret.artistScrobbles = await AlbumScrobble.count({ artist: album.artist }) || 0;

			res.json(ret);
		})
		.catch(err => console.log(err));

	lastfm.setSessionCredentials(null, null);
}