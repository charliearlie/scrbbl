import React from 'react';
import Button from '@material-ui/core/Button';
import withStyles from '@material-ui/core/styles/withStyles';

const styles = theme => ({
	button: {
		margin: theme.spacing.unit,
		backgroundColor: '#c3000d',
		color: 'white',
		marginTop: '16px',
		justifySelf: 'flex-end',
	},
});

const ScrbblButton = ({
	classes,
	style,
	disabled,
	children,
	onClick,
	className,
}) => (
	<Button
		variant="raised"
		onClick={onClick}
		className={`${classes.button} ${className}`}
		style={{ ...style }}
		disabled={disabled}
	>
		{children}
	</Button>
);

export default withStyles(styles, { withTheme: true })(ScrbblButton);
