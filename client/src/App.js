import React, { Component, Suspense, lazy } from 'react';
import classNames from 'classnames';
import qs from 'qs';
import axios from 'axios';
import { Route, Redirect } from 'react-router-dom';
import withStyles from '@material-ui/core/styles/withStyles';
import Grid from '@material-ui/core/Grid';
import Drawer from '@material-ui/core/Drawer';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import Snackbar from '@material-ui/core/Snackbar';
import './App.css';
import Home from './components/Home';
import Login from './components/Login';
import DrawerItems from './assets/DrawerItems';
import UserNav from './components/UserNav';
import SnackbarContent from './components/reusable/Snackbar/SnackbarContent';
import SideDrawerList from './components/SideDrawerList';

const ManualScrobble = lazy(() => import('./components/ManualScrobble'));
const AlbumScrobble = lazy(() => import('./pages/AlbumScrobble'));

const drawerWidth = 280;

const styles = theme => ({
	root: {
		flexGrow: 1,
		zIndex: 1,
		overflow: 'hidden',
		position: 'relative',
		display: 'flex',
		minHeight: '100vh',
	},
	appBar: {
		zIndex: theme.zIndex.drawer + 1,
		transition: theme.transitions.create(['width', 'margin'], {
			easing: theme.transitions.easing.sharp,
			duration: theme.transitions.duration.leavingScreen,
		}),
		backgroundColor: '#c3000d',
	},
	appBarShift: {
		marginLeft: drawerWidth,
		width: `calc(100% - ${drawerWidth}px)`,
		transition: theme.transitions.create(['width', 'margin'], {
			easing: theme.transitions.easing.sharp,
			duration: theme.transitions.duration.enteringScreen,
		}),
	},
	menuButton: {
		marginLeft: 12,
		marginRight: 36,
	},
	hide: {
		display: 'none',
	},
	drawerPaper: {
		position: 'relative',
		whiteSpace: 'nowrap',
		width: drawerWidth,
		transition: theme.transitions.create('width', {
			easing: theme.transitions.easing.sharp,
			duration: theme.transitions.duration.enteringScreen,
		}),
	},
	drawerPaperClose: {
		overflowX: 'hidden',
		transition: theme.transitions.create('width', {
			easing: theme.transitions.easing.sharp,
			duration: theme.transitions.duration.leavingScreen,
		}),
		width: 0,
		[theme.breakpoints.up('sm')]: {
			width: theme.spacing.unit * 9,
		},
	},
	toolbar: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'flex-end',
		padding: '0 8px',
		...theme.mixins.toolbar,
	},
	content: {
		flexGrow: 1,
		backgroundColor: theme.palette.background.default,
		padding: theme.spacing.unit * 3,
	},
});

class App extends Component {
	constructor(props) {
		super(props);

		this.state = {
			displayName: window.localStorage.getItem('ScrbblUser'),
			open: false,
			showSnackbar: false,
		};

		this.handleDrawerOpen = this.handleDrawerOpen.bind(this);
		this.handleDrawerClose = this.handleDrawerClose.bind(this);
		this.handleSnackbarClose = this.handleSnackbarClose.bind(this);
	}

	componentDidMount() {
		const params = qs.parse(window.location.search.slice(1));

		if (params.token && !this.state.displayName) {
			axios.get(`/api/users/session/${params.token}`)
				.then((response) => {
					window.localStorage.setItem('ScrbblUser', response.data.username);
					window.localStorage.setItem('ScrbblKey', response.data.key);
					this.setState({ displayName: response.data.username, showSnackbar: true });
				})
				.catch((error) => { throw new Error(error); });
		}
	}

	handleDrawerOpen() {
		this.setState({ open: true });
	}

	handleDrawerClose() {
		this.setState({ open: false });
	}

	handleSnackbarClose() {
		this.setState({ showSnackbar: false });
	}

	/* eslint-disable */
	login() {
		const callbackUrl = window.location.href.split('?')[0];
		const requestUrl = 'http://www.last.fm/api/auth/?api_key=5e51b3c171721101d22f4101dd227f66&cb=' + callbackUrl;
		return window.location.href = requestUrl;
	}
	/* eslint-enable */

	render() {
		const { classes } = this.props;
		return (
			<div className={classes.root}>
				<AppBar
					position="absolute"
					className={classNames(classes.appBar, this.state.open && classes.appBarShift)}
				>
					<Toolbar disableGutters={!this.state.open}>
						<IconButton
							color="inherit"
							aria-label="open drawer"
							onClick={this.handleDrawerOpen}
							className={classNames(classes.menuButton, this.state.open && classes.hide)}
						>
							<MenuIcon />
						</IconButton>
						<div style={{ display: 'flex', margin: 'auto' }}>
							<Typography variant="title" color="inherit" noWrap>
								Scrbbl <i style={{ marginTop: '4px' }} className="fab fa-lastfm" />
							</Typography>
						</div>
						<UserNav displayName={this.state.displayName} />
					</Toolbar>
				</AppBar>
				<Drawer
					variant="permanent"
					classes={{
						paper: classNames(classes.drawerPaper, !this.state.open && classes.drawerPaperClose),
					}}
					open={this.state.open}
				>
					<div className={classes.toolbar}>
						<IconButton onClick={this.handleDrawerClose}>
							<ChevronLeftIcon />
						</IconButton>
					</div>
					<Divider />
					<SideDrawerList closeDrawer={() => this.setState({ open: false })} items={DrawerItems} />
					<Divider />
				</Drawer>

				{/* App body */}
				<main className={classes.content}>
					<div className={classes.toolbar} />
					{window.localStorage.getItem('ScrbblUser') ?
						<Grid container spacing={24}>
							<Suspense fallback={<div>Loading...</div>}>
								<Route exact path="/" component={Home} />
								<Route path="/manual" component={ManualScrobble} />
								<Route path="/album" component={AlbumScrobble} />
								<Route path="/callback" render={() => <Redirect to={{ pathname: '/' }} />} />
							</Suspense>
						</Grid>
						:
						<Login authenticate={this.login} />
					}
				</main>
				<Snackbar
					anchorOrigin={{
						vertical: 'bottom',
						horizontal: 'left',
					}}
					open={this.state.showSnackbar}
					autoHideDuration={5000}
					onClose={this.handleSnackbarClose}
				>
					<SnackbarContent
						onClose={this.handleSnackbarClose}
						variant="success"
						message="Logged in successfully"
					/>
				</Snackbar>
			</div>
		);
	}
}

export default withStyles(styles, { withTheme: true })(App);
