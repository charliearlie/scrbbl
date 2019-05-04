import React from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import AlbumSearchResult from './AlbumSearchResult';

const styles = () => ({
	container: {
		width: '100%',
		display: 'flex',
		justifyContent: 'center',
	},
	results: {
		display: 'flex',
		justifyContent: 'center',
		flexDirection: 'column',
		alignItems: 'center',
		width: '100%',
	},
});

const AlbumSearchResults = ({ results, handleScrobbleSuccess, classes }) => (
	<div className={classes.results}>
		{results.map(result => (
			<div className={classes.container}>
				<AlbumSearchResult
					key={`${result.album}_${result.albumId}`}
					result={result}
					handleScrobbleSuccess={handleScrobbleSuccess}
				/>
			</div>
		))}
	</div>
);

export default withStyles(styles)(AlbumSearchResults);
