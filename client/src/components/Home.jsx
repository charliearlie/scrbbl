import React, { Fragment } from 'react';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

import HomeContentCard from './HomeContentCard';
import homeContentCardData from '../assets/homeContentCardData';

const styles = theme => ({
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
	header: {
		color: 'rgba(0, 0, 0, 0.65)',
		fontWeight: 'bold',
		fontSize: '4rem',
	},
	subheader: {
		fontSize: '2rem',
		fontFamily: '"Work Sans"',
		color: 'rgba(0, 0, 0, 0.54)',
		margin: '8px',
	},
	construction: {
		fontSize: '1.1rem',
		fontFamily: '"Work Sans"',
		color: 'rgba(0, 0, 0, 0.54)',
		margin: '8px',
	},
	button: {
		margin: theme.spacing.unit,
		backgroundColor: '#c3000d',
		color: 'white',
		marginTop: '16px',
		justifySelf: 'flex-end',
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

const Home = (props) => {
	const { classes } = props;
	return (
		<Fragment>
			<div className={classes.headerContainer}>
				<Typography variant="display3" className={classes.header}>
					Scrbbl
				</Typography>
				<br />
				<h3 className={classes.subheader}>The manual Last.FM scrobbler</h3>
				<h5 className={classes.construction}>Currently under construction</h5>
			</div>
			{homeContentCardData.map(data => (
				<Grid item xs={12} md={4}>
					<HomeContentCard
						icon={data.icon}
						content={data.content}
					/>
				</Grid>
			))}
		</Fragment>
	);
};

export default withStyles(styles, { withTheme: true })(Home);
