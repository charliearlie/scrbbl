import React, { Component, Fragment } from 'react';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';

import Card from './reusable/Card';
import TextInput from './reusable/TextInput';
import AppleMusicButton from './AppleMusicButton';
import AlbumSearchResults from './AlbumSearchResults';
import Fade from './reusable/Fade';

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

		this.fillForm = this.fillForm.bind(this);
	}

	fillForm(albums) {
		const albumList = albums.map(album => ({
			albumId: album.collectionId,
			artist: album.artistName,
			albumTitle: album.collectionName,
			albumArtist: album.artistName,
			albumArtwork: album.artworkUrl100,
			releaseYear: album.releaseDate.slice(0, 4) || '',
		}));

		this.setState({ searchResults: albumList });
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
				<Grid item xs={false} md={2} />
				{this.state.searchResults &&
					<Fragment>
						Search Results
						<Fade in={this.state.searchResults}>
							<AlbumSearchResults results={this.state.searchResults} callback={this.scrobble} />
						</Fade>
					</Fragment>
				}
			</Fragment>
		);
	}
}

export default withStyles(styles, { withTheme: true })(AlbumScrobble);
