import React, { Component, Fragment } from 'react';
import axios from 'axios';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import qs from 'qs';

import endpoints from '../config/endpoints';
import Card from './reusable/Card';
import TextInput from './reusable/TextInput';
import ScrbblButton from './reusable/ScrbblButton';
import AppleMusicButton from './AppleMusicButton';

const styles = theme => ({
	container: {
		display: 'flex',
		height: '100vh',
	},
	card: {
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'center',
		padding: '14px 40px',
		backgroundColor: '#fff',
	},
	input: {
		margin: '36px',
	},
	header: {
		textAlign: 'center',
		fontSize: '2.2rem',
		color: '#777',
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
	buttonSection: {
		display: 'flex',
	},
	'@media (max-width: 420px)': {
		buttonSection: {
			flexDirection: 'column',
		},
	},
	dateContainer: {
		marginTop: '12px',
		display: 'flex',
		flexDirection: 'column',
	},
	textField: {
		marginLeft: theme.spacing.unit,
		marginRight: theme.spacing.unit,
		width: 270,
	},
});

const initialState = {
	artist: '',
	track: '',
	album: '',
	albumArtist: '',
	date: '',
	time: '',
	scrobbled: false,
};

class ManualScrobble extends Component {
	constructor(props) {
		super(props);

		this.state = initialState;

		this.scrobble = this.scrobble.bind(this);
		this.fillForm = this.fillForm.bind(this);
	}

	fillForm(songDetails) {
		this.setState({
			artist: songDetails.artistName,
			track: songDetails.trackName,
			album: songDetails.collectionName,
			albumArtist: songDetails.artistName,
		});
	}

	scrobble() {
		const requestBody = this.state;
		requestBody.user = window.localStorage.getItem('ScrbblUser');
		requestBody.key = window.localStorage.getItem('ScrbblKey');

		axios({
			method: 'post',
			url: endpoints.manualScrobble,
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
		const { albumArtist, songTitle } = this.state;
		const isDisabled = !albumArtist && !songTitle;
		return (
			<Fragment>
				<Grid item xs={false} md={2} />
				<Grid item xs={12} md={8}>
					<h2 className={classes.header}>Manual Scrobble</h2>
					<Card
						className={classes.card}
						shadowLevel={1}
					>
						{this.state.scrobbled ?
							<Fragment>
								<div>
									Track scrobbled successfully
								</div>
								<div>
									<ScrbblButton
										variant="raised"
										onClick={() => this.setState(initialState)}
									>
										Scrobble another
									</ScrbblButton>
								</div>
							</Fragment>
							:
							<Fragment>
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
									value={this.state.track}
									onChange={e => this.handleChange(e.target.value, e.target.name)}
									required
									multiline
								/>
								<TextInput
									placeholder="Album title"
									name="albumTitle"
									value={this.state.album}
									onChange={e => this.handleChange(e.target.value, e.target.name)}
									multiline
								/>
								<TextInput
									placeholder="Album artist"
									name="albumArtist"
									value={this.state.albumArtist}
									onChange={e => this.handleChange(e.target.value, e.target.name)}
								/>
								<div className={classes.dateContainer}>
									<TextField
										name="date"
										label="Date scrobbled"
										type="date"
										className={classes.textField}
										InputLabelProps={{
											shrink: true,
										}}
										onChange={e => this.handleChange(e.target.value.toString(), e.target.name)}
									/>
									<TextField
										name="time"
										label="Time scrobbled"
										type="time"
										className={classes.textField}
										InputLabelProps={{
											shrink: true,
										}}
										onChange={e => this.handleChange(e.target.value, e.target.name)}
									/>
								</div>
								<div className={classes.buttonSection}>
									<ScrbblButton
										variant="raised"
										onClick={this.scrobble}
										disabled={isDisabled}
									>
										Scrobble
									</ScrbblButton>
									<AppleMusicButton
										query={`${this.state.artist} ${this.state.track}`}
										fillForm={this.fillForm}
										type="musicTrack"
									>
										<i className="fab fa-apple" /> &nbsp;music tags*
									</AppleMusicButton>
								</div>
							</Fragment>
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
