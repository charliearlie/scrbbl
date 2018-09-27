import React, { Component } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { withStyles } from '@material-ui/core/styles';
import Config from '../config/endpoints';
import ScrbblButton from './reusable/ScrbblButton';

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
	search() {
		const { query, type } = this.props;
		axios.get(`${Config.endpoints.albumSearch}?term=${query.replace(' ', '+')}&media=music&entity=${type}`)
			.then((response) => {
				console.log(response);
				const result = type === 'album' ? response.data.results : response.data.results[0];
				if (result) {
					this.props.fillForm(result);
				}
			});
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
