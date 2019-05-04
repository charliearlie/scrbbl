import React from 'react';
import axios from 'axios';
import moment from 'moment';
import classnames from 'classnames';
import withStyles from '@material-ui/core/styles/withStyles';
import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import MuiDialogContent from '@material-ui/core/DialogContent';
import AlbumSearchResultInput from './AlbumSearchResultInput';
import AlbumSearchResultDateDialog from './AlbumSearchResultDateDialog';
import ScrbblButton from '../reusable/ScrbblButton';
import Config from '../../config/endpoints';

const styles = () => ({
	resultTrack: {
		padding: '8px',
		display: 'flex',
		minWidth: '500px',
		'@media (max-width: 750px)': {
			minWidth: '300px',
		},
		'@media (max-width: 500px)': {
			minWidth: '200px',
			padding: '2px 0',
		},
		'@media (max-width: 350px)': {
			width: '100%',
			padding: '2px 0',
			fontSize: '0.8rem',
		},
	},
	button: {
		maxWidth: '100%',
		justifySelf: 'flex-end',
		display: 'block',
		boxShadow:
			'0px 1px 5px 0px rgba(0, 0, 0, 0.2), 0px 2px 2px 0px rgba(0, 0, 0, 0.14), 0px 3px 1px -2px rgba(0, 0, 0, 0.12)',
		padding: '8px',
		border: 0,
		cursor: 'pointer',
		font: '400 11px system-ui',
		textTransform: 'uppercase',
		color: 'white',
		height: '38px',
	},
	calendarButton: {
		background: '#118AB2',
		marginBottom: '2px',
	},
});

const DialogContent = withStyles(() => ({
	root: {
		margin: 0,
		padding: 0,
	},
}))(MuiDialogContent);

class AlbumDialog extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			albumTitle: this.props.album.album || '',
			date: moment(),
			showDate: false,
			initialTracks: null,
			resultTracks: null,
		};

		this.handleTrackChange = this.handleTrackChange.bind(this);
		this.loadTracks = this.loadTracks.bind(this);
		this.requestTracks = this.requestTracks.bind(this);
		this.scrobble = this.scrobble.bind(this);
	}

	componentDidMount() {
		this.loadTracks();
	}

	handleDateChange(date) {
		this.setState({ date });
	}

	handleTrackChange(songTitle, index) {
		const tracks = [...this.state.resultTracks];
		tracks[index].songTitle = songTitle;

		this.setState({ resultTracks: tracks });
	}

	async scrobble() {
		if (!this.state.initialTracks) {
			await this.loadTracks();
		}

		const requestBody = {
			tracks: this.state.resultTracks.filter(track => track.checked),
			albumInfo: {
				...this.props.album,
				album: this.state.albumTitle,
				timestamp: Math.floor(this.state.date.format('x') / 1000),
			},
		};

		axios({
			method: 'post',
			url: Config.endpoints.albumScrobble,
			headers: {
				username: window.localStorage.getItem('ScrbblUser'),
				key: window.localStorage.getItem('ScrbblKey'),
			},
			data: requestBody,
		}).then(response => {
			const { albumScrobbles } = response.data;
			const message = `Success! You have scrobbled ${
				this.state.albumTitle
			} ${albumScrobbles} times on Scrbbl`;

			this.props.handleScrobbleSuccess(message);
			// this.setState({ scrobbled: !!albumScrobbles });
		});

		this.props.closeDialog();
	}

	requestTracks() {
		const { albumId } = this.props.album;

		if (!this.state.initialTracks) {
			return axios.get(`${Config.endpoints.albumDetails}${albumId}`);
		}

		return false;
	}

	async loadTracks() {
		const response = await this.requestTracks();
		const tracks = response.data;

		this.setState({
			initialTracks: tracks,
			resultTracks: tracks.map(track => ({
				checked: true,
				...track,
			})),
		});
	}

	render() {
		const { resultTracks } = this.state;
		const { album, classes } = this.props;
		console.log(album);
		return (
			<Dialog
				open={this.props.show}
				onClose={this.props.closeDialog}
				maxWidth="lg"
				scroll="paper"
				aria-labelledby="scroll-dialog-title"
			>
				<div style={{ padding: '16px 32px' }}>
					<h2 style={{ marginBottom: '0' }} id="form-dialog-title">
						{album.artist} - {album.album}
					</h2>
					<h4 style={{ marginTop: '0' }}>{album.releaseYear}</h4>
					{this.state.showDate ? (
						<AlbumSearchResultDateDialog
							selectedDate={this.state.date}
							onChangeDate={this.handleDateChange}
						/>
					) : (
						<button
							variant="raised"
							onClick={() => this.setState({ showDate: !this.state.showDate })}
							className={classnames(classes.button, classes.calendarButton)}
						>
							<i className="fas fa-calendar-alt fa-2x" />{' '}
						</button>
					)}
					<DialogContent>
						{resultTracks &&
							resultTracks.map((track, index) => (
								<div className={classes.resultTrack}>
									<AlbumSearchResultInput
										handleTrackChange={this.handleTrackChange}
										songTitle={track.songTitle}
										trackNumber={index}
									/>
									<Checkbox
										checked={resultTracks[index].checked}
										value={index}
										onChange={() => {
											const tracks = this.state.resultTracks;
											tracks[index].checked = !tracks[index].checked;
											this.setState({ resultTracks: tracks });
										}}
									/>
								</div>
							))}
					</DialogContent>
					<DialogActions>
						<Button onClick={this.props.closeDialog} color="primary">
							Cancel
						</Button>
						<ScrbblButton variant="raised" onClick={this.scrobble}>
							Scrobble
						</ScrbblButton>
					</DialogActions>
				</div>
			</Dialog>
		);
	}
}

export default withStyles(styles)(AlbumDialog);
