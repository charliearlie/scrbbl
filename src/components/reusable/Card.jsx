import React from 'react';
import PropTypes from 'prop-types';

const Card = (props) => {
	const cardShadowLevels = {
		1: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
		2: '0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)',
		3: '0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)',
		4: '0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22)',
		5: '0 19px 38px rgba(0,0,0,0.30), 0 15px 12px rgba(0,0,0,0.22)',
	};

	const defaultStyles = {
		margin: '16px',
		padding: '16px',
	};

	const { styles, className, shadowLevel } = props;
	return (
		<div
			className={className}
			style={{ ...defaultStyles, ...styles, boxShadow: cardShadowLevels[shadowLevel] }}
		>
			{props.children}
		</div>
	);
};

Card.propTypes = {
	children: PropTypes.node.isRequired,
	styles: PropTypes.objectOf(),
	shadowLevel: PropTypes.number,
	className: PropTypes.string,
};

Card.defaultProps = {
	styles: {},
	shadowLevel: 1,
	className: '',
};

export default Card;
