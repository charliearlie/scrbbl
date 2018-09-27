import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

Enzyme.configure({ adapter: new Adapter() });

/* eslint-disable */
global.window = {};
global.window.localStorage = {
	getItem: function(key) {
		return this[key];
	},
	setItem: function(key, value) {
		this[key] = value;
	},
	removeItem: function(key) {
		delete this[key];
	},
};