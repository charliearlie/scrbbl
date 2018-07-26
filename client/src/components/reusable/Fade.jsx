import React from 'react';
// import { CSSTransition } from 'react-transition-group';

// const Fade = ({ children, ...props }) => (
// 	<CSSTransition key="fade" {...props} timeout={1000} className="fade">
// 		{children}
// 	</CSSTransition>
// );

// export default Fade;

import { Transition } from 'react-transition-group';

const duration = 3000;

const defaultStyle = {
	transition: 'transform 3s ease-out',
	transform: 'scaleY(0)',
};

const transitionStyles = {
	entering: { opacity: 0 },
	entered: { transform: 'scaleY(1)' },
};

const Fade = ({ children, ...props }) => (
	<Transition {...props} timeout={duration}>
		{state => (
			<div style={{
				...defaultStyle,
				...transitionStyles[state],
			}}
			>
				{children}
			</div>
		)}
	</Transition>
);

export default Fade;
