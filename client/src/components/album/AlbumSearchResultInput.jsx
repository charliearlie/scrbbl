import React, { Component } from 'react';
import PropTypes from 'prop-types';
import withStyles from '@material-ui/core/styles/withStyles';

const styles = theme => ({
	track: {
		padding: '16px',
	},
	trackInput: {
		backgroundColor: theme.palette.common.white,
		border: '1px solid #ced4da',
		fontSize: 16,
		padding: '10px 12px',
		width: 'calc(100% - 24px)',
		transition: theme.transitions.create(['border-color', 'box-shadow']),
		'&:focus': {
			borderColor: '#80bdff',
			boxShadow: '0 0 0 0.2rem rgba(0,123,255,.25)',
		},
	},
});

class AlbumSearchResultInput extends Component {
	constructor(props) {
		super(props);
		this.state = {
			songTitle: props.songTitle,
		};
		this.handleChange = this.handleChange.bind(this);
		this.onBlur = this.onBlur.bind(this);
	}

	onBlur() {
		const { trackNumber } = this.props;
		this.props.handleTrackChange(this.state.songTitle, trackNumber);
	}

	handleChange(event) {
		const { value } = event.target;
		this.setState({ songTitle: value });
	}

	render() {
		const { classes } = this.props;
		return (
			<input
				type="text"
				className={classes.trackInput}
				onBlur={this.onBlur}
				onChange={this.handleChange}
				value={this.state.songTitle}
				{...this.props}
			/>
		);
	}
}

AlbumSearchResultInput.propTypes = {
	classes: PropTypes.objectOf().isRequired,
	handleTrackChange: PropTypes.func.isRequired,
	trackNumber: PropTypes.number,
	trackName: PropTypes.string.isRequired,
};

AlbumSearchResultInput.defaultProps = {
	trackNumber: 0,
};

export default withStyles(styles, { withTheme: true })(AlbumSearchResultInput);
