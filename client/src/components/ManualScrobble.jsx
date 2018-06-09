import React, { Component, Fragment } from 'react';
import axios from 'axios';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import qs from 'qs';

import Card from './reusable/Card';
import TextInput from './reusable/TextInput';
import ScrbblButton from './reusable/ScrbblButton';
import AppleMusicButton from './AppleMusicButton';

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
		padding: '14px 40px',
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
	appleMusicButton: {
		backgroundColor: '#f2f2f2',
		color: '#000',
	},
	textInput: {
		width: '80%',
	},
});

class ManualScrobble extends Component {
	constructor(props) {
		super(props);

		this.state = {
			scrobbled: false,
		};

		this.scrobble = this.scrobble.bind(this);
		this.fillForm = this.fillForm.bind(this);
	}

	fillForm(songDetails) {
		this.setState({
			artist: songDetails.artistName,
			songTitle: songDetails.trackName,
			albumTitle: songDetails.collectionName,
			albumArtist: songDetails.artistName,
		});
	}

	scrobble() {
		const requestBody = this.state;
		requestBody.userName = window.localStorage.getItem('ScrbblUser');
		requestBody.key = window.localStorage.getItem('ScrbblKey');

		axios({
			method: 'post',
			url: 'http://localhost:8081/scrobble/manual', // need to fix the API proxy
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			data: qs.stringify({ ...requestBody }),
		}).then(this.setState({ scrobbled: true }));
	}

	handleChange(value, name) {
		this.setState({ [name]: value });
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
						<TextInput
							placeholder="Artist"
							name="artist"
							value={this.state.artist}
							onChange={e => this.handleChange(e.target.value, e.target.name)}
							autoFocus
							required
						/>
						<TextInput
							placeholder="Song title"
							name="songTitle"
							value={this.state.songTitle}
							onChange={e => this.handleChange(e.target.value, e.target.name)}
							required
							multiline
						/>
						<TextInput
							placeholder="Album title"
							name="albumTitle"
							value={this.state.albumTitle}
							onChange={e => this.handleChange(e.target.value, e.target.name)}
							multiline
						/>
						<TextInput
							placeholder="Album artist"
							name="albumArtist"
							value={this.state.albumArtist}
							onChange={e => this.handleChange(e.target.value, e.target.name)}
						/>
						<div style={{ display: 'flex' }}>
							<ScrbblButton
								variant="raised"
								onClick={this.scrobble}
							>
								Scrobble
							</ScrbblButton>
							<AppleMusicButton
								song={this.state}
								fillForm={this.fillForm}
								type="musicTrack"
							/>
						</div>
						{this.state.scrobbled &&
							<div>Your song scrobbled</div>
						}
					</Card>
					*Apple Music tagging is an experimental feature
				</Grid>
				<Grid item xs={false} md={2} />
			</Fragment>
		);
	}
}

export default withStyles(styles, { withTheme: true })(ManualScrobble);
