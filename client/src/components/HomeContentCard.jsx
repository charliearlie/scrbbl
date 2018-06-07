import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

import Card from './reusable/Card';

const styles = () => ({
	card: {
		justifyContent: 'center',
		height: '300px',
		alignItems: 'center',
		padding: '0',
		backgroundColor: '#fff',
	},
	cardHeader: {
		width: '100%',
		backgroundColor: '#eee',
		height: '20%',
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
	},
	content: {
		padding: '12px',
	},
});

const HomeContentCard = (props) => {
	const { classes } = props;
	return (
		<Card
			shadowLevel={1}
			className={classes.card}
		>
			<div className={classes.cardHeader}>
				{props.icon}
			</div>

			<Typography variant="body1" className={classes.content} gutterBottom>
				{props.content}
			</Typography>
		</Card>
	);
};

export default withStyles(styles, { withTheme: true })(HomeContentCard);
