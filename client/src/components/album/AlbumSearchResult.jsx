import React, { Component, Fragment } from 'react';
import axios from 'axios';
import classnames from 'classnames';
import { Grid, Checkbox } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import { serverEndpoints } from '../../config/endpoints';
import Card from '../reusable/Card';
import AlbumSearchResultInput from './AlbumSearchResultInput';
import ScrbblButton from '../reusable/ScrbblButton';

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
		marginBottom: '0',
		transition: 'height 2.5s linear',
		overflow: 'hidden',
		width: '100%',
	},
	showTracksHide: {
		height: '0',
	},
	showTracksShow: {
		height: 'auto',
	},
});

class AlbumSearchResult extends Component {
	constructor(props) {
		super(props);
		this.state = { showTracks: false, resultTracks: null, initialTracks: null, scrobbled: false };

		this.handleClick = this.handleClick.bind(this);
		this.handleTrackChange = this.handleTrackChange.bind(this);
		this.scrobble = this.scrobble.bind(this);
	}

	async scrobble() {
		if (!this.state.initialTracks) {
			await this.loadTracks();
		}

		const requestBody = this.state.resultTracks;

		axios({
			method: 'post',
			url: serverEndpoints.albumScrobble,
			headers: {
				username: window.localStorage.getItem('ScrbblUser'),
				key: window.localStorage.getItem('ScrbblKey'),

			},
			data: requestBody,
		}).then(this.setState({ scrobbled: true }));
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

		console.log(tracks);
		this.setState({ resultTracks: tracks });
	}

	render() {
		const { result, classes } = this.props;
		const { showTracks, resultTracks } = this.state;
		const trackClasses = classnames(
			classes.showTracks,
			`${showTracks ? classes.showTracksShow : classes.showTracksHide}`,
		);

		return (
			<Card
				className={classes.resultCard}
				shadowLevel={1}
			>
				<Fragment>
					<div className={classes.result}>
						<img src={result.albumArtwork} alt={result.albumTitle} />
						<div className={classes.resultInfo}>
							<Grid container spacing={12}>
								<Grid item xs={9}>
									<div>{result.albumTitle}</div>
									<div className={classes.resultArtist}>{result.albumArtist}</div>
									<div className={classes.resultYear}>{result.releaseYear}</div>
								</Grid>
								<Grid item xs={3}>
									<ScrbblButton
										variant="raised"
										onClick={this.scrobble}
									>
										Scrobble
									</ScrbblButton>
								</Grid>
							</Grid>
							<div className={classes.showTracks}>
								<Button
									onClick={this.handleClick}
									className={classes.showTracks}
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
