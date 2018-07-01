import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Card from './reusable/Card';

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
	resultInfo: {
		padding: '8px',
		fontSize: '1.1rem',

	},
	resultArtist: {
		color: '#666',
	},
	resultYear: {
		fontSize: '.8rem',
	},
});

const AlbumSearchResult = ({ result, classes }) => (
	<Card
		className={classes.resultCard}
		shadowLevel={1}
	>
		<div className={classes.result}>
			<img src={result.albumArtwork} alt={result.albumTitle} />
			<div className={classes.resultInfo}>
				<div>{result.albumTitle}</div>
				<div className={classes.resultArtist}>{result.albumArtist}</div>
				<div className={classes.resultYear}>{result.releaseYear}</div>
			</div>
		</div>
	</Card>
);

export default withStyles(styles, { withTheme: true })(AlbumSearchResult);
