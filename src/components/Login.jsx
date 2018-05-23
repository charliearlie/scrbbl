import React from 'react';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

import Card from './reusable/Card';

const styles = theme => ({
	root: {
		display: 'flex',
		height: '100vh',
	},
	button: {
		margin: theme.spacing.unit,
	},
	card: {
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'center',
		height: '300px',
		alignItems: 'center',
		padding: '0 64px',
	},
});

const Login = (props) => {
	const { classes, authenticate } = props;

	return (
		<div className={classes.root}>
			<Grid item xs={3} />
			<Grid item xs={6}>
				<Card
					shadowLevel={5}
					className={classes.card}
				>
					<Typography variant="body1" gutterBottom>
						To access this application, you need to sign in to your Last.FM account
					</Typography>
					<Button
						variant="raised"
						onClick={authenticate}
						color="secondary"
						className={classes.button}
					>
						Login to Last.FM
					</Button>
				</Card>
			</Grid>
			<Grid item xs={3} />
		</div>
	);
};

export default withStyles(styles, { withTheme: true })(Login);
