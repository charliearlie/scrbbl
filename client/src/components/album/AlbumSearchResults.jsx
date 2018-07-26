import React, { Fragment } from 'react';
import Grid from '@material-ui/core/Grid';
import AlbumSearchResult from './AlbumSearchResult';

const AlbumSearchResults = ({ results }) => (
	<Grid container spacing={24}>
		{results.map(result => (
			<Fragment>
				<Grid item xs={false} sm={2} lg={3} />
				<Grid item xs={12} sm={8} lg={6}>
					<AlbumSearchResult result={result} />
				</Grid>
				<Grid item xs={false} sm={2} lg={3} />
			</Fragment>
		))}
	</Grid>
);

export default AlbumSearchResults;
