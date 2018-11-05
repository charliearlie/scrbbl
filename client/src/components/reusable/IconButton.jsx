import React from 'react';
import PropTypes from 'prop-types';
import withStyles from '@material-ui/core/styles/withStyles';

const styles = () => ({
	button: {
		backgroundColour: 'transparent',
		cursor: 'pointer',
		color: '#2196F3',
		border: 'none',
		fontSize: '1rem',
	},
});

const IconButton = ({ icon, onClick, classes }) => (
	<button
		className={classes.button}
		onClick={onClick}
	>
		<i className={icon} />
	</button>
);

IconButton.propTypes = {
	onClick: PropTypes.func.isRequired,
	icon: PropTypes.string.isRequired,
};

export default withStyles(styles, { withTheme: true })(IconButton);
