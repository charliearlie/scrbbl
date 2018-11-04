import React, { Component, Fragment } from 'react';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import { Snackbar } from '@material-ui/core';

import Card from '../components/reusable/Card';
import TextInput from '../components/reusable/TextInput';
import AppleMusicButton from '../components/AppleMusicButton';
import AlbumSearchResults from '../components/album/AlbumSearchResults';
import Fade from '../components/reusable/Fade';
import SnackbarContent from '../components/reusable/Snackbar/SnackbarContent';

const styles = () => ({
	container: {
		display: 'flex',
		height: '100vh',
	},
	card: {
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'center',
		height: '200px',
		alignItems: 'center',
		padding: '14px 40px',
		backgroundColor: '#fff',
	},
	resultCard: {
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'center',
		height: '80px',
		margin: '8px',
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

class AlbumScrobble extends Component {
	constructor(props) {
		super(props);

		this.state = {
			searchQuery: '',
			showSnackbar: false,
		};
		this.fillForm = this.fillForm.bind(this);
		this.handleSnackbarClose = this.handleSnackbarClose.bind(this);
		this.handleScrobbleSuccess = this.handleScrobbleSuccess.bind(this);
	}

	fillForm(albums) {
		const albumList = albums.map(album => ({
			albumId: album.collectionId,
			artist: album.artistName,
			album: album.collectionName,
			albumArtwork: album.artworkUrl100,
			releaseYear: album.releaseDate.slice(0, 4) || '',
		}));

		this.setState({ searchResults: albumList });
	}

	handleChange(value, name) {
		this.setState({ [name]: value });
	}

	handleSnackbarClose() {
		this.setState({ showSnackbar: false });
	}

	handleScrobbleSuccess(snackbarMessage) {
		this.setState({ snackbarMessage, showSnackbar: true });
	}

	render() {
		const { classes } = this.props;
		return (
			<Fragment>
				<Grid item xs={false} lg={2} />
				<Grid item xs={12} lg={8}>
					<Card
						className={classes.card}
						shadowLevel={1}
					>
						<TextInput
							placeholder="Search..."
							name="searchQuery"
							value={this.state.searchQuery}
							onChange={e => this.handleChange(e.target.value, e.target.name)}
							autoFocus
							required
						/>
						<div style={{ display: 'flex' }}>
							<AppleMusicButton
								query={this.state.searchQuery}
								fillForm={this.fillForm}
								type="album"
							>
								Search
							</AppleMusicButton>
						</div>
					</Card>
				</Grid>
				<Grid item xs={false} lg={2} />
				{this.state.searchResults &&
					<Fragment>
						Search Results
						<Fade in={this.state.searchResults}>
							<AlbumSearchResults
								results={this.state.searchResults}
								handleScrobbleSuccess={this.handleScrobbleSuccess}
							/>
						</Fade>
					</Fragment>
				}
				<Snackbar
					anchorOrigin={{
						vertical: 'bottom',
						horizontal: 'left',
					}}
					open={this.state.showSnackbar}
					autoHideDuration={10000}
					onClose={this.handleSnackbarClose}
				>
					<SnackbarContent
						onClose={this.handleSnackbarClose}
						variant="success"
						message={this.state.snackbarMessage}
					/>
				</Snackbar>
			</Fragment>
		);
	}
}

export default withStyles(styles, { withTheme: true })(AlbumScrobble);
