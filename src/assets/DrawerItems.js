import React from 'react';
import HomeIcon from '@material-ui/icons/Home';
import RadioIcon from '@material-ui/icons/Radio';
import CollectionIcon from '@material-ui/icons/Collections';

const drawerItems = [
	{
		icon: <HomeIcon />,
		text: 'Home',
	},
	{
		icon: <i className="fab fa-lastfm" style={{ fontSize: '25px' }} />,
		text: 'Scrobble manually',
	},
	{
		icon: <CollectionIcon />,
		text: 'Scrobble album',
	},
	{
		icon: <RadioIcon />,
		text: 'Scrobble from Radio',
	},
];

export default drawerItems;
