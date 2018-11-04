const serverEndpoints = {
	albumDetails: '/api/appleMusic/album/details/',
	albumScrobble: '/api/scrobble/album',
	albumSearch: '/api/appleMusic/search',
	manualScrobble: '/api/scrobble/manual',
};

const mockEndpoints = {
	albumDetails: '../assets/mockApi/albumDetails.json',
	albumScrobble: '../assets/mockApi/albumScrobble.json',
	albumSearch: '../assets/mockApi/albumSearch.json',
	manualScrobble: '../assets/mockApi/manualScrobble.json',
};


function getEndpoints() {
	return process.env.REACT_APP_USE_MOCKS ? mockEndpoints : serverEndpoints;
}

export default { endpoints: getEndpoints() };
