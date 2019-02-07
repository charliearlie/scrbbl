import React, { Component } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import withStyles from '@material-ui/core/styles/withStyles';
import Config from '../config/endpoints';
import ScrbblButton from './reusable/ScrbblButton';
import { search } from '../util/appleMusic';

const styles = () => ({
	appleMusicButton: {
		backgroundColor: '#f2f2f2',
		color: '#000',
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
		const { classes } = this.props;
		return (
			<ScrbblButton
				variant="raised"
				onClick={this.search}
				className={classes.appleMusicButton}
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
