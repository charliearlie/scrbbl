import React from 'react';
import { mountWrap } from './assets/testHelpers/routeWrapper';
import ScrbblButton from './components/reusable/ScrbblButton';
import UserNav from './components/UserNav';
import App from './App';

describe('<App />', () => {
	const wrappedMount = () => mountWrap(<App />);

	it('should render', () => {
		const app = wrappedMount();
		expect(app.length).toBe(1);
	});

	describe('not authenticated', () => {
		it('should render a login prompt if user is not logged in', () => {
			const app = wrappedMount();
			const prompt = app.find('.Login__prompt').first();
			const message = prompt.find('p').text();
			const button = prompt.find(ScrbblButton);

			expect(prompt.length).toBe(1);
			expect(message).toBe('To access this application, you need to sign in to your Last.FM account');
			expect(button.length).toBe(1);
			expect(button.text()).toBe('Login');
		});
	});

	describe('authenticated', () => {
		let app;

		beforeAll(() => {
			app = wrappedMount();
		});

		it('should display a user menu on the top app bar', () => {
			const userNav = app.find(UserNav);
			expect(userNav.length).toBe(1);
		});
	});
});
