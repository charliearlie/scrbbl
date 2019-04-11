import React, { useEffect, useState } from 'react';
import axios from 'axios';
import withStyles from '@material-ui/core/styles/withStyles';
import Card from '../components/reusable/Card';
import bbcradio1 from '../assets/bbcradio1.svg';
import bbcradio2 from '../assets/bbcradio2.svg';
import bbc1xtra from '../assets/bbc1xtra.svg';

const styles = () => ({
	stationWrapper: {
		display: 'flex',
		alignItems: 'center',
		margin: '0 auto',
	},
	stationCard: {
		display: 'flex',
		height: '200px',
		width: '200px',
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'center',
		padding: '14px 40px',
		backgroundColor: '#fff',
		margin: '8px 16px',
		borderRadius: '50%',
		cursor: 'pointer',
		'&:hover': {
			background: '#EEE',
		},
	},
	image: {
		height: '40%',
		width: 'auto',
	},
});

const imageMap = {
	bbcradio1,
	bbcradio2,
	bbc1xtra,
};

function RadioScrobble({ classes }) {
	const [stations, setStations] = useState([]);
	useEffect(() => {
		const fetchStations = async () => {
			const response = await axios('/api/radio/getStations');
			setStations(() =>
				response.data.map(
					station => ({
						...station,
						image: imageMap[station.profile],
					}),
					[],
				),
			);
		};
		fetchStations();
	});
	return (
		<div className={classes.stationWrapper}>
			{stations.map(station => (
				<button className={classes.stationCard}>
					<img className={classes.image} src={station.image} alt={station.title} />
				</button>
			))}
		</div>
	);
}

export default withStyles(styles, { withTheme: true })(RadioScrobble);
