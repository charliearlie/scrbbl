const axios = require('axios');

exports.getAlbumDetails = (req, res) => {
    const { albumId } = req.params;
    axios.get(`http://itunes.apple.com/lookup?id=${albumId}&entity=song`)
        .then(response => {
            const albumArtist = response.data.results.find(r => r.wrapperType === 'collection').artistName;
            const results = response.data.results
                .filter(result => result.wrapperType === 'track')
                .map(result => ({
                    artist: result.artistName,
                    albumArtist,
                    albumTitle: result.collectionName,
                    songTitle: result.trackName,
                    trackNumber: result.trackNumber,
                    trackTime: result.trackTimeMillis,
                }));
            res.send(results);
        })
        .catch(error => res.json(error));
}