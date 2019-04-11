import React, { Fragment } from 'react';
import withStyles from '@material-ui/core/styles/withStyles';

import headerSvg from '../assets/musicManual.svg';

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
		marginBottom: '8px',
	},
	title: {
		margin: '8px 0',
		fontSize: '3rem',
		fontWeight: '800',
		letterSpacing: '4px',
	},
	subtitle: {
		margin: '8px 0',
	},
	imageWrapper: {
		width: '100%',
		height: '250px',
		display: 'flex',
		justifyContent: 'center',
		'@media (max-width: 1024px)': {
			height: '180px',
		},
	},
	headerImage: {
		width: '100%',
		height: '100%',
		objectFit: 'contain',
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
		<Fragment>
			<div className={classes.headerContainer}>
				<h2 className={classes.title}>Scrbbl</h2>
				<h4 className={classes.subtitle}>Making manual scrobbling a bit less.. manual</h4>
				<div className={classes.imageWrapper}>
					<img className={classes.headerImage} src={headerSvg} alt="header" />
				</div>
			</div>
			<div>
				<h4>Recently scrobbled albums</h4>
			</div>
		</Fragment>
	);
};

export default withStyles(styles, { withTheme: true })(Home);
