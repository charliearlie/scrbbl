import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import * as serviceWorker from './registerServiceWorker';
import './index.css';
import App from './App';

const theme = createMuiTheme({
	overrides: {
		MuiPickersToolbar: {
			toolbar: {
				backgroundColor: '#c3000d',
			},
		},
		MuiPickersCalendarHeader: {
			switchHeader: {
				// backgroundColor: lightBlue.A200,
				// color: 'white',
			},
		},
		MuiPickersDay: {
			isSelected: {
				backgroundColor: '#c3000d',
			},
			current: {
				color: '#c3000d',
			},
		},
		MuiPickersModal: {
			dialogAction: {
				color: '#c3000d',
			},
		},
		MuiPickerDTTabs: {
			tabs: {
				backgroundColor: '#c3000d',
			},
		},
		MuiPrivateTabIndicator: {
			colorSecondary: {
				backgroundColor: '#03A9F4',
			},
		},
		MuiPickersClockPointer: {
			pointer: {
				backgroundColor: '#c3000d',
			},
			noPoint: {
				backgroundColor: '#c3000d',
			},
		},
		MuiPickersClockNumber: {
			selected: {
				backgroundColor: '#c3000d',
			},
		},
	},
	typography: {
		fontFamily: '"Nunito", "Roboto", "Helvetica", "Arial", sans-serif',
	},
});

ReactDOM.render(
	<MuiThemeProvider theme={theme}>
		<BrowserRouter>
			<App />
		</BrowserRouter>
	</MuiThemeProvider>,
	document.getElementById('root'),
);

serviceWorker.unregister();
