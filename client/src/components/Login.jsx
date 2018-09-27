import React from 'react';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

import Card from './reusable/Card';
import ScrbblButton from './reusable/ScrbblButton';

const styles = theme => ({
	root: {
		display: 'flex',
		height: '100vh',
	},
	button: {
		margin: theme.spacing.unit,
		backgroundColor: '#c3000d',
		color: 'white',
		marginTop: '16px',
		justifySelf: 'flex-end',
	},
	card: {
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'center',
		height: '300px',
		alignItems: 'center',
		padding: '0 64px',
		backgroundColor: '#fff',
	},
});

const Login = ({ classes, authenticate }) => (
	<div className={classes.root}>
		<Grid item xs={false} sm={1} md={3} />
		<Grid item xs={12} sm={10} md={6} >
			<Card
				shadowLevel={5}
				className={`${classes.card} Login__prompt`}
			>
				<Typography variant="body1" gutterBottom>
					To access this application, you need to sign in to your Last.FM account
				</Typography>
				<ScrbblButton
					variant="raised"
					onClick={authenticate}
					className={classes.button}
				>
					Login
				</ScrbblButton>
			</Card>
		</Grid>
		<Grid item xs={false} sm={1} md={3} />
	</div>
);

export default withStyles(styles, { withTheme: true })(Login);
