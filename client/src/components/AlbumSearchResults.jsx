import React, { Fragment } from 'react';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Card from './reusable/Card';

const styles = () => ({
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
});

const AlbumSearchResults = ({ results, classes }) => (
	<Grid container spacing={24}>
		{results.map(result => (
			<Fragment>
				<Grid item xs={false} md={2} />
				<Grid item xs={12} md={8}>
					<Card
						className={classes.resultCard}
						shadowLevel={1}
					>
						{result.albumTitle}
					</Card>
				</Grid>
				<Grid item xs={false} md={2} />
			</Fragment>
		))}
	</Grid>
);

export default withStyles(styles, { withTheme: true })(AlbumSearchResults);
