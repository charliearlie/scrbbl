import React, { Component, Fragment } from 'react';
import axios from 'axios';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import qs from 'qs';

import Card from './reusable/Card';
import TextInput from './reusable/TextInput';
import ScrbblButton from './reusable/ScrbblButton';
import AppleMusicButton from './AppleMusicButton';
import AlbumSearchResults from './AlbumSearchResults';

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
			scrobbled: false,
		};

		this.fillForm = this.fillForm.bind(this);
	}

	fillForm(albums) {
		const albumList = albums.map(album => ({
			artist: album.artistName,
			albumTitle: album.collectionName,
			albumArtist: album.artistName,
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
						{this.state.scrobbled &&
							<div>Your song scrobbled</div>
						}
					</Card>
				</Grid>
				<Grid item xs={false} md={2} />
				{this.state.searchResults &&
					<AlbumSearchResults results={this.state.searchResults} />
				}
			</Fragment>
		);
	}
}

export default withStyles(styles, { withTheme: true })(AlbumScrobble);
