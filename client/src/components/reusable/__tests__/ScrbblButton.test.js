import React from 'react';
import sinon from 'sinon';
import { mount } from 'enzyme';
import ScrbblButton from '../ScrbblButton';

describe('<ScrbblButton />', () => {
	const scrobbleSpy = sinon.spy();

	const target = mount(
		<ScrbblButton
			variant="raised"
			onClick={scrobbleSpy}
		>
			Scrobble
		</ScrbblButton>);

	afterEach(() => {
		scrobbleSpy.resetHistory();
	});

	it('should render', () => {
		const button = target.find(ScrbblButton);
		expect(button.length).toBe(1);
	});

	it('renders the children', () => {
		const button = target.find(ScrbblButton);
		expect(button.text()).toBe('Scrobble');
	});

	it('should call the scrobble function when clicked', () => {
		const button = target.find(ScrbblButton);
		button.simulate('click');

		sinon.assert.calledOnce(scrobbleSpy);
	});

	it('should not call the scrobble function when disabled', () => {
		target.setProps({ disabled: true });

		const button = target.find(ScrbblButton);
		button.simulate('click');

		sinon.assert.notCalled(scrobbleSpy);
	});
});
