import React, { Component } from 'react';
import withStyles from '@material-ui/core/styles/withStyles';

const styles = () => ({
	container: {
		display: 'flex',
		height: '100vh',
	},
});

class AlbumADay extends Component {
	render() {
		return (
			<div>
				<h1>Album a day</h1>
			</div>
		);
	}
}

export default withStyles(styles)(AlbumADay);
