import React from 'react';
import HomeIcon from '@material-ui/icons/Home';
import RadioIcon from '@material-ui/icons/Radio';
import CollectionIcon from '@material-ui/icons/Collections';

const drawerItems = [
	{
		icon: <HomeIcon />,
		text: 'Home',
		route: '/',
	},
	{
		icon: <i className="fab fa-lastfm" style={{ fontSize: '25px' }} />,
		text: 'Scrobble manually',
		route: '/manual',
	},
	{
		icon: <CollectionIcon />,
		text: 'Scrobble album',
		route: '/album',
	},
	{
		icon: <RadioIcon />,
		text: 'Scrobble from Radio',
		route: '/radio',
	},
];

export default drawerItems;
