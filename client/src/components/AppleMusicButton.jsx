import React, { Component } from 'react';
import PropTypes from 'prop-types';
import withStyles from '@material-ui/core/styles/withStyles';
import ScrbblButton from './reusable/ScrbblButton';
import { search } from '../util/appleMusic';

const styles = () => ({
	appleMusicButton: {
		backgroundColor: '#f2f2f2',
		color: '#000',
		textTransform: 'none',
	},
});

class AppleMusicButton extends Component {
	constructor(props) {
		super(props);

		this.search = this.search.bind(this);
	}

	// !TODO: This component is no longer needed
	async search() {
		const { query, type } = this.props;
		const result = await search(query, type);

		if (result) {
			this.props.fillForm(result);
		}
	}

	render() {
		const { classes, styles, variant = 'raised' } = this.props;
		console.log(variant);
		return (
			<ScrbblButton
				variant={variant}
				onClick={this.search}
				className={classes.appleMusicButton}
				style={styles}
			>
				{this.props.children}
			</ScrbblButton>
		);
	}
}

AppleMusicButton.propTypes = {
	fillForm: PropTypes.func.isRequired,
};

export default withStyles(styles, { withTheme: true })(AppleMusicButton);
