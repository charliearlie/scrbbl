import React from 'react';
import Button from '@material-ui/core/Button';
import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
	button: {
		margin: theme.spacing.unit,
		backgroundColor: '#c3000d',
		color: 'white',
		marginTop: '16px',
		justifySelf: 'flex-end',
	},
});

const ScrbblButton = (props) => {
	const { classes, style } = props;
	return (
		<Button
			variant="raised"
			onClick={props.onClick}
			className={classes.button}
			{...style}
		>
			{props.children}
		</Button>
	);
};

export default withStyles(styles, { withTheme: true })(ScrbblButton);
