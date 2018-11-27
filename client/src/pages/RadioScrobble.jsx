import React, { Component, Fragment } from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import Grid from '@material-ui/core/Grid';
import Card from '../components/reusable/Card';

const styles = () => ({
	radioWrapper: {
		display: 'flex',
	},
	card: {
		minHeight: '300px',
	},
});

class RadioScrobble extends Component {
	constructor(props) {
		super(props);
		this.state = { };
	}

	render() {
		const { classes } = this.props;
		return (
			<Fragment>
				<Grid item xs={false} md={2} />
				<Grid item xs={12} md={8}>
					<Card
						className={classes.card}
						shadowLevel={1}
					>
						<div className={classes.radioWrapper}>
							<Grid item xs={6} md={4} lg={3} />
							<Grid item xs={6} md={4} lg={3} />
							<Grid item xs={6} md={4} lg={3} />
							<Grid item xs={6} md={4} lg={3} />
						</div>
					</Card>
				</Grid>
				<Grid item xs={false} md={2} />
			</Fragment>
		);
	}
}

export default withStyles(styles, { withTheme: true })(RadioScrobble);
