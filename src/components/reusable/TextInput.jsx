import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Input from '@material-ui/core/Input';

const styles = () => ({
	input: {
		margin: '16px',
	},
	underline: {
		'&:after': {
			borderBottomColor: '#c3000d',
		},
	},
});

const TextInput = (props) => {
	const { classes } = props;

	return (
		<Input
			{...props}
			className={classes.input}
			classes={{
				underline: classes.underline,
			}}
		/>
	);
};

export default withStyles(styles, { withTheme: true })(TextInput);
