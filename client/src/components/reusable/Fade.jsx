import React from 'react';
import { CSSTransition } from 'react-transition-group';

const Fade = ({ children, ...props }) => (
	<CSSTransition {...props} timeout={1000} className="fade">
		{children}
	</CSSTransition>
);

export default Fade;
