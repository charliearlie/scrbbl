const LastfmApi = require('lastfmapi');
const lastfm = new LastfmApi({
	api_key: '5e51b3c171721101d22f4101dd227f66',
	secret: 'f7cb71083eceb100599f7f47d9c220a3',
});

module.exports = lastfm;