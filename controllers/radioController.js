exports.getRadioStations = (req, res) => {
	res.json([
		{
			title: 'BBC Radio 1',
			profile: 'bbcradio1',
		},
		{
			title: 'BBC Radio 2',
			profile: 'bbcradio2',
		},
		{
			title: 'BBC Radio 1Xtra',
			profile: 'bbc1xtra',
		},
		// {
		// 	title: 'BBC Radio 6 Music',
		// 	profile: 'bbc6music',
		// },
	]);
};
