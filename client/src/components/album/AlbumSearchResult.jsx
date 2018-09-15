import React, { Component, Fragment } from 'react';
import axios from 'axios';
import classnames from 'classnames';
import { Grid, Checkbox } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import { serverEndpoints } from '../../config/endpoints';
import Card from '../reusable/Card';
import AlbumSearchResultInput from './AlbumSearchResultInput';
import IconButton from '../reusable/IconButton';
import TextInput from '../reusable/TextInput';

const styles = () => ({
	resultCard: {
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'center',
		height: 'auto',
		margin: '8px',
		alignItems: 'center',
		backgroundColor: '#fff',
	},
	result: {
		display: 'flex',
		width: '100%',
		alignItems: 'center',
	},
	resultTrack: {
		padding: '16px',
	},
	resultInfo: {
		padding: '8px 8px 0 8px',
		fontSize: '1.1rem',
		width: '100%',
	},
	resultFields: {
		display: 'inline',
		width: '80%',
	},
	resultArtist: {
		color: '#666',
	},
	resultYear: {
		fontSize: '.8rem',
	},
	showTracks: {
		display: 'flex',
		justifyContent: 'center',
	},
	showTracksHide: {
		height: '0',
	},
	showTracksShow: {
		height: 'auto',
	},
	buttonContainer: {
		width: '100%',
		display: 'flex',
		justifyContent: 'center',

	},
	button: {
		maxWidth: '100%',
		marginTop: '16px',
		marginLeft: 'auto',
		justifySelf: 'flex-end',
		display: 'block',
		boxShadow: '0px 1px 5px 0px rgba(0, 0, 0, 0.2), 0px 2px 2px 0px rgba(0, 0, 0, 0.14), 0px 3px 1px -2px rgba(0, 0, 0, 0.12)',
		padding: '4px 8px',
		border: 0,
		cursor: 'pointer',
		font: '400 11px system-ui',
		textTransform: 'uppercase',
		color: 'white',
	},
	buttonNotScrobbled: {
		backgroundColor: '#c3000d',
	},
	buttonScrobbled: {
		backgroundColor: '#4CAF50',
		cursor: 'not-allowed',
	},
});

class AlbumSearchResult extends Component {
	constructor(props) {
		super(props);
		this.state = {
			showTracks: false,
			resultTracks: null,
			initialTracks: null,
			scrobbled: false,
			albumTitle: this.props.result.album || '',
		};

		this.handleClick = this.handleClick.bind(this);
		this.handleTrackChange = this.handleTrackChange.bind(this);
		this.scrobble = this.scrobble.bind(this);
	}

	async scrobble() {
		if (!this.state.initialTracks) {
			await this.loadTracks();
		}

		const requestBody = {
			tracks: this.state.resultTracks,
			albumInfo: this.props.result,
		};

		axios({
			method: 'post',
			url: serverEndpoints.albumScrobble,
			headers: {
				username: window.localStorage.getItem('ScrbblUser'),
				key: window.localStorage.getItem('ScrbblKey'),

			},
			data: requestBody,
		}).then((response) => {
			const { scrobbled } = response.data;
			this.setState({ scrobbled });
		});
	}

	requestTracks() {
		const { albumId } = this.props.result;

		if (!this.state.initialTracks) {
			return axios.get(`${serverEndpoints.albumDetails}${albumId}`);
		}

		return false;
	}

	async loadTracks() {
		const response = await this.requestTracks();
		const tracks = response.data;

		this.setState({ initialTracks: tracks, resultTracks: tracks });
	}

	handleClick() {
		if (!this.state.initialTracks) {
			this.loadTracks();
		}
		this.setState(({ showTracks }) => ({ showTracks: !showTracks }));
	}

	handleTrackChange(songTitle, index) {
		const tracks = [...this.state.resultTracks];
		tracks[index].songTitle = songTitle;

		this.setState({ resultTracks: tracks });
	}

	render() {
		const { result, classes } = this.props;
		const { showTracks, resultTracks, scrobbled } = this.state;
		const scrobbleButtonClasses = classnames(
			classes.button,
			`${scrobbled ? classes.buttonScrobbled : classes.buttonNotScrobbled}`,
		);
		const trackClasses = classnames(
			classes.trackList,
			`${showTracks ? classes.showTracksShow : classes.showTracksHide}`,
		);

		const renderAlbumTitle = () => {
			if (this.state.editAlbumTitle) {
				return (
					<TextInput
						placeholder="Search..."
						name="albumTitle"
						value={this.state.albumTitle}
						onChange={event => this.setState({ albumTitle: event.target.value })}
					/>
				);
			}
			return this.state.albumTitle;
		};

		return (
			<Card
				className={classes.resultCard}
				shadowLevel={1}
			>
				<Fragment>
					<div className={classes.result}>
						<img src={result.albumArtwork} alt={result.album} />
						<div className={classes.resultInfo}>
							<Grid container spacing={12}>
								<Grid item xs={9}>
									<div>
										{renderAlbumTitle()}
										<IconButton
											icon="far fa-edit"
											onClick={() => this.setState(prevState => ({ editAlbumTitle: !prevState.editAlbumTitle }))}
										/>
									</div>
									<div className={classes.resultArtist}>{result.artist}</div>
									<div className={classes.resultYear}>{result.releaseYear}</div>
								</Grid>
								<Grid item xs={3}>
									<button
										variant="raised"
										onClick={this.scrobble}
										className={scrobbleButtonClasses}
										disabled={scrobbled}
									>
										{!scrobbled ?
											<i style={{ marginTop: '4px' }} className="fab fa-lastfm fa-2x" />
											:
											<i style={{ marginTop: '4px' }} className="fas fa-check fa-2x" />
										}
									</button>
								</Grid>
							</Grid>
							<div className={classes.showTracks}>
								<Button
									onClick={this.handleClick}
									className={classes.showTracksButton}
								>
									{`${showTracks ? 'Hide' : 'Show'} tracks`}
								</Button>
							</div>
						</div>
					</div>
					<div className={trackClasses}>
						{showTracks && resultTracks && resultTracks.map((track, index) => (
							<div className={classes.resultTrack}>
								<Grid key={track.songTitle} container spacing={12}>
									<Grid item xs={1} />
									<Grid item xs={10}>
										<AlbumSearchResultInput
											handleTrackChange={this.handleTrackChange}
											songTitle={track.songTitle}
											trackNumber={index}
										/>
									</Grid>
									<Grid item xs={1}>
										<Checkbox
											checked
											value={index}
											classes={{
												marginLeft: '16px',
											}}
										/>
									</Grid>
								</Grid>
							</div>
						))}
					</div>
				</Fragment>
			</Card>
		);
	}
}

export default withStyles(styles, { withTheme: true })(AlbumSearchResult);
