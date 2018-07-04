import React from 'react';
import { shallow } from 'enzyme';
import Card from '../Card';

const cardShadowLevels = [
	'0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
	'0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)',
	'0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)',
	'0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22)',
	'0 19px 38px rgba(0,0,0,0.30), 0 15px 12px rgba(0,0,0,0.22)',
];

describe('<Card />', () => {
	describe('component box shadow', () => {
		cardShadowLevels.forEach((shadowLevel, index) => {
			const target = shallow(<Card shadowLevel={index + 1}><h1>Hello Jest</h1></Card>);
			it(`should have a box shadow of ${shadowLevel} when the shadowLevel prop is ${index + 1}`, () => {
				const wrapper = target.find('div');
				expect(wrapper.get(0).props.style).toHaveProperty('boxShadow', shadowLevel);
			});
		});
	});

	it('should display children in the card', () => {
		const target = shallow(<Card shadowLevel={1}><h1>Hello Jest</h1></Card>);
		const header = target.find('h1');

		expect(header.text()).toEqual('Hello Jest');
	});
});
