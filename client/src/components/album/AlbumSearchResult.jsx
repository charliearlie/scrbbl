import React, { Component, Fragment } from 'react';
import axios from 'axios';
import classnames from 'classnames';
import { Grid, Checkbox } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import endpoints from '../../config/endpoints';
import Card from '../reusable/Card';
import AlbumSearchResultInput from './AlbumSearchResultInput';

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
		this.state = { showTracks: false, resultTracks: null, initialTracks: null };

		this.handleClick = this.handleClick.bind(this);
		this.handleTrackChange = this.handleTrackChange.bind(this);
	}

	handleClick() {
		const { albumId } = this.props.result;

		if (!this.state.initialTracks) {
			axios.get(`${endpoints.albumDetails}${albumId}`)
				.then(response => this.setState({
					resultTracks: response.data,
					initialTracks: response.data,
				}));
		}
		this.setState(({ showTracks }) => ({ showTracks: !showTracks }));
	}

	handleTrackChange(trackName, index) {
		const tracks = [...this.state.resultTracks];
		tracks[index].trackName = trackName;

		this.setState({ resultTracks: tracks });
	}

	render() {
		const { result, classes } = this.props;
		const { showTracks, initialTracks } = this.state;
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
							<div>{result.albumTitle}</div>
							<div className={classes.resultArtist}>{result.albumArtist}</div>
							<div className={classes.resultYear}>{result.releaseYear}</div>
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
						{initialTracks && initialTracks.map((track, index) => (
							<div className={classes.resultTrack}>
								<Grid key={track.songTitle} container spacing={12}>
									<Grid item xs={1} />
									<Grid item xs={10}>
										<AlbumSearchResultInput
											handleTrackChange={this.handleTrackChange}
											trackName={track.songTitle}
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
