import React from 'react';
import HomeIcon from '@material-ui/icons/Home';
import RadioIcon from '@material-ui/icons/Radio';
import CollectionIcon from '@material-ui/icons/Collections';

const drawerItems = [
	{
		icon: <HomeIcon />,
		text: 'Home',
		shortText: 'Home',
		route: '/',
	},
	{
		icon: <i className="fab fa-lastfm" style={{ fontSize: '25px' }} />,
		text: 'Scrobble manually',
		shortText: 'Manual',
		route: '/manual',
	},
	{
		icon: <CollectionIcon />,
		text: 'Scrobble album',
		shortText: 'Album',
		route: '/album',
	},
	{
		icon: <RadioIcon />,
		text: 'Scrobble from Radio',
		shortText: 'Radio',
		route: '/radio',
	},
];

export default drawerItems;
