import React, { Component } from 'react';
import axios from 'axios';
import { withStyles } from '@material-ui/core/styles';

import ScrbblButton from './reusable/ScrbblButton';

const styles = () => ({
	appleMusicButton: {
		backgroundColor: '#f2f2f2',
		color: '#000',
	},
});

class AppleMusicButton extends Component {
	constructor(props) {
		super(props);

		this.search = this.search.bind(this);
	}
	search() {
		const { artist, songTitle } = this.props.song;
		const { type } = this.props;
		axios.get(`https://itunes.apple.com/search?term=${artist.replace(' ', '+')}+${songTitle.replace(' ', '+')}&media=music&entity=${type}`)
			.then((response) => {
				const firstChoice = response.data.results[0];
				if (firstChoice) {
					this.props.fillForm(firstChoice);
				}
			});
	}

	render() {
		const { classes } = this.props;
		return (
			<ScrbblButton
				variant="raised"
				onClick={this.search}
				className={classes.appleMusicButton}
			>
				<i className="fab fa-apple" /> &nbsp;music tags*
			</ScrbblButton>
		);
	}
}

export default withStyles(styles, { withTheme: true })(AppleMusicButton);
