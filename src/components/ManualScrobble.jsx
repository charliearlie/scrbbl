import React, { Component, Fragment } from 'react';
import axios from 'axios';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import qs from 'qs';

import Card from './reusable/Card';
import TextInput from './reusable/TextInput';
import ScrbblButton from './reusable/ScrbblButton';

const styles = () => ({
	container: {
		display: 'flex',
		height: '100vh',
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
	input: {
		margin: '36px',
	},
	cssUnderline: {
		'&:after': {
			borderBottomColor: '#c3000d',
		},
	},
});

class ManualScrobble extends Component {
	constructor(props) {
		super(props);

		this.state = {
			scrobbled: false,
		};

		this.scrobble = this.scrobble.bind(this);
	}
	handleChange(e) {
		const { name, value } = e.target;
		this.setState({ [name]: value });
	}

	scrobble() {
		const requestBody = this.state;
		requestBody.userName = window.localStorage.getItem('ScrbblUser');
		requestBody.key = window.localStorage.getItem('ScrbblKey');

		axios({
			method: 'post',
			url: 'http://localhost:3000/scrobble/manual',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			data: qs.stringify({ ...requestBody }),
		}).then(this.setState({ scrobbled: true }));
	}

	render() {
		const { classes } = this.props;
		console.log(this.state);
		return (
			<Fragment>
				<Grid item xs={false} md={2} />
				<Grid item xs={12} md={8}>
					<Card
						className={classes.card}
						shadowLevel={1}
					>
						<TextInput
							placeholder="Artist"
							name="artist"
							inputProps={{
								'aria-label': 'Artist',
							}}
							onChange={e => this.handleChange(e)}
						/>
						<TextInput
							placeholder="Song title"
							name="songTitle"
							inputProps={{
								'aria-label': 'Song title',
							}}
							onChange={e => this.handleChange(e)}
						/>
						<TextInput
							placeholder="Album title"
							name="albumTitle"
							inputProps={{
								'aria-label': 'Album title',
							}}
							onChange={e => this.handleChange(e)}
						/>
						<TextInput
							placeholder="Album artist"
							name="albumArtist"
							inputProps={{
								'aria-label': 'Album artist',
							}}
							onChange={e => this.handleChange(e)}
						/>
						<ScrbblButton
							variant="raised"
							onClick={this.scrobble}
						>
							Scrobble
						</ScrbblButton>
						{this.state.scrobbled &&
							<div>Your song scrobbled</div>
						}
					</Card>
				</Grid>
				<Grid item xs={false} md={2} />
			</Fragment>
		);
	}
}

export default withStyles(styles, { withTheme: true })(ManualScrobble);
