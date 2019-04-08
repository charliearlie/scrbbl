import React from 'react';
import withStyles from '@material-ui/core/styles/withStyles';

import HomeContentCard from './HomeContentCard';
import homeContentCardData from '../assets/homeContentCardData';

const styles = () => ({
	root: {
		display: 'flex',
		height: '100vh',
	},
	headerContainer: {
		display: 'flex',
		alignItems: 'center',
		flexDirection: 'column',
		width: '100%',
		marginBottom: '64px',
	},
	imageWrapper: {
		width: '100%',
		height: '300px',
	},
	headerImage: {
		width: '100%',
		height: '100%',
		objectFit: 'cover',
	},
	header: {
		color: 'rgba(0, 0, 0, 0.65)',
		fontWeight: 'bold',
		fontSize: '4rem',
	},
	cards: {
		display: 'flex',
		width: '75%',
		justifyContent: 'space-around',
	},
	row: {
		flexBasis: '25%',
		marginTop: '-80px',
	},
	'@media (max-width: 1000px)': {
		cards: {
			flexDirection: 'column',
			marginTop: '12px',
		},
		row: {
			marginTop: '12px',
		},
	},
	'@media (max-width: 600px)': {
		subheader: {
			fontSize: '1.4rem',
		},
	},
	'@media (max-width: 450px)': {
		subheader: {
			fontSize: '1.1rem',
		},
	},
});

const Home = props => {
	const { classes } = props;
	return (
		<div className={classes.headerContainer}>
			<div className={classes.imageWrapper}>
				<img
					className={classes.headerImage}
					src="https://res.cloudinary.com/recipeze/image/upload/v1549486051/iphone.jpg"
					alt="header"
				/>
			</div>
			<div className={classes.cards}>
				{homeContentCardData.map(data => (
					<div className={classes.row}>
						<HomeContentCard icon={data.icon} content={data.content} />
					</div>
				))}
			</div>
		</div>
	);
};

export default withStyles(styles, { withTheme: true })(Home);
