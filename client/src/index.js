import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import * as serviceWorker from './registerServiceWorker';
import './index.css';
import App from './App';


const theme = createMuiTheme({
	typography: {
		fontFamily: '"Work Sans", "Roboto", "Helvetica", "Arial", sans-serif',
	},
});

ReactDOM.render(
	<MuiThemeProvider theme={theme}>
		<BrowserRouter>
			<App />
		</BrowserRouter>
	</MuiThemeProvider>, document.getElementById('root'));

serviceWorker.unregister();
