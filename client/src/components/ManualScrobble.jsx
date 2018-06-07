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
		this.getAppleMusicTags = this.getAppleMusicTags.bind(this);
	}

	getAppleMusicTags() {
		axios.get(`https://itunes.apple.com/search?term=${this.state.artist.replace(' ', '+')}+${this.state.songTitle.replace(' ', '+')}&media=music&entity=musicTrack`)
			.then((response) => {
				const firstChoice = response.data.results[0];
				this.setState({
					artist: firstChoice.artistName,
					songTitle: firstChoice.trackName,
					albumTitle: firstChoice.collectionName,
					albumArtist: firstChoice.artistName,
				});
			});
	}

	scrobble() {
		const requestBody = this.state;
		requestBody.userName = window.localStorage.getItem('ScrbblUser');
		requestBody.key = window.localStorage.getItem('ScrbblKey');

		axios({
			method: 'post',
			url: '/scrobble/manual',
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
							<ScrbblButton
								variant="raised"
								onClick={this.getAppleMusicTags}
								className={classes.appleMusicButton}
							>
								<i className="fab fa-apple" /> &nbsp;music tags*
							</ScrbblButton>
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
