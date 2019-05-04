import React, { Component, Fragment } from 'react';
import Grid from '@material-ui/core/Grid';
import withStyles from '@material-ui/core/styles/withStyles';
import Card from '../reusable/Card';
import TextInput from '../reusable/TextInput';
import AlbumDialog from './AlbumDialog';

const styles = () => ({
	resultCard: {
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'center',
		height: 'auto',
		margin: '8px',
		alignItems: 'center',
		backgroundColor: '#fff',
		borderRadius: '4px',
		cursor: 'pointer',
		'&:hover': {
			backgroundColor: '#eee',
		},
		'@media (min-width: 250px)': {
			minWidth: '80%',
			maxWidth: '80%',
		},
		'@media (min-width: 600px)': {
			minWidth: '400px',
		},
		'@media (min-width: 800px)': {
			minWidth: '600px',
		},
	},
	result: {
		display: 'flex',
		width: '100%',
		alignItems: 'center',
		cursor: 'pointer',
	},
	resultTrack: {
		padding: '16px',
		display: 'flex',
	},
	resultInfo: {
		padding: '0 8px',
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
		color: '#666',
	},
	image: {
		borderTopLeftRadius: '4px',
		borderBottomLeftRadius: '4px',
	},
});

class AlbumSearchResult extends Component {
	constructor(props) {
		super(props);
		this.state = {
			dialogOpen: false,
		};

		this.handleDialogOpen = this.handleDialogOpen.bind(this);
		this.handleDialogClose = this.handleDialogClose.bind(this);
	}

	handleDialogOpen() {
		this.setState({ dialogOpen: true });
	}

	handleDialogClose() {
		this.setState({ dialogOpen: false });
	}

	render() {
		const { result, classes } = this.props;

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
			return result.album;
		};

		return (
			<Card className={classes.resultCard} shadowLevel={1}>
				<Fragment>
					<AlbumDialog
						show={this.state.dialogOpen}
						closeDialog={this.handleDialogClose}
						album={result}
					/>
					{/* This needs to become a button for a11y purposes */}
					<div role="button" onClick={this.handleDialogOpen} className={classes.result}>
						<img
							className={classes.image}
							src={result.albumArtwork}
							alt={result.album}
						/>
						<div className={classes.resultInfo}>
							<Grid container spacing={12}>
								<Grid item xs={9} className={classes.infoWrapper}>
									<div>{renderAlbumTitle()}</div>
									<div className={classes.resultArtist}>{result.artist}</div>
									<div className={classes.resultYear}>{result.releaseYear}</div>
								</Grid>
								<Grid item xs={3} />
							</Grid>
						</div>
					</div>
				</Fragment>
			</Card>
		);
	}
}

export default withStyles(styles, { withTheme: true })(AlbumSearchResult);
