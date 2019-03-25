import React, { lazy, useEffect, useState } from 'react';
import axios from 'axios';
import withStyles from '@material-ui/core/styles/withStyles';
import Card from '../components/reusable/Card';
import bbcRadio1 from '../assets/bbcradio1.svg';
import bbcRadio2 from '../assets/bbcradio2.svg';
import bbc1xtra from '../assets/bbc1xtra.svg';

const styles = () => ({
	stationWrapper: {
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		margin: '0 auto',
	},
	stationCard: {
		display: 'flex',
		height: '100px',
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'center',
		padding: '14px 40px',
		backgroundColor: '#fff',
		margin: '8px 16px',
	},
	image: {
		height: '100%',
		width: 'auto',
	},
});

const imageMap = {
	bbcradio1: bbcRadio1,
	bbcradio2: bbcRadio2,
	bbc1xtra: bbc1xtra,
};

function RadioScrobble({ classes }) {
	const [stations, setStations] = useState([]);
	useEffect(() => {
		const fetchStations = async () => {
			const response = await axios('/api/radio/getStations');
			setStations(() => {
				return response.data.map(
					station => ({
						...station,
						image: imageMap[station.profile],
					}),
					[],
				);
			});
		};
		fetchStations();
	});
	return (
		<div className={classes.stationWrapper}>
			{stations.map(station => (
				<Card className={classes.stationCard}>
					<img className={classes.image} src={station.image} />
				</Card>
			))}
		</div>
	);
}

export default withStyles(styles, { withTheme: true })(RadioScrobble);
