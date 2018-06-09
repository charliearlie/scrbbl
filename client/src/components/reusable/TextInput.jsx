import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';

const styles = theme => ({
	textInput: {
		fontSize: '16px',
		'&:after': {
			borderBottomColor: '#c3000d',
		},
	},
	textField: {
		marginLeft: theme.spacing.unit,
		marginRight: theme.spacing.unit,
		width: 300,
	},
	textFieldContainer: {
		padding: '4px',
	},
	label: {
		fontSize: '18px',
	},
});

const TextInput = (props) => {
	const { classes } = props;

	return (
		<div className={classes.textFieldContainer}>
			<TextField
				{...props}
				className={classes.textField}
				InputProps={{
					className: classes.textInput,
				}}
				InputLabelProps={{
					className: classes.label,
				}}
			/>
		</div>
	);
};

export default withStyles(styles, { withTheme: true })(TextInput);
