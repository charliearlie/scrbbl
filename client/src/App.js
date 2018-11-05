import React, { Suspense, lazy, useState, useEffect } from 'react';
import classNames from 'classnames';
import qs from 'qs';
import axios from 'axios';
import { Route, Redirect } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Drawer from '@material-ui/core/Drawer';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import { Snackbar } from '@material-ui/core';
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

function App(props) {
	const [displayName, setDisplayName] = useState(window.localStorage.getItem('ScrbblUser'));
	const [open, setOpen] = useState(false);
	const [showSnackbar, setShowSnackbar] = useState(false);

	const { classes } = props;

	const login = () => {
		const callbackUrl = window.location.href.split('?')[0];
		const requestUrl = `http://www.last.fm/api/auth/?api_key=5e51b3c171721101d22f4101dd227f66&cb=${callbackUrl}`;
		window.location.href = requestUrl;
	};

	useEffect(() => {
		const params = qs.parse(window.location.search.slice(1));

		if (params.token && !displayName) {
			axios.get(`/api/users/session/${params.token}`)
				.then((response) => {
					window.localStorage.setItem('ScrbblUser', response.data.username);
					window.localStorage.setItem('ScrbblKey', response.data.key);
					setDisplayName(response.data.username);
					setShowSnackbar(true);
				})
				.catch((error) => { throw new Error(error); });
		}
	}, []);

	const handleDrawerOpen = () => {
		setOpen(true);
	};

	const handleDrawerClose = () => {
		setOpen(false);
	};

	const handleSnackbarClose = () => {
		setShowSnackbar(false);
	};

	return (
		<div className={classes.root}>
			<AppBar
				position="absolute"
				className={classNames(classes.appBar, open && classes.appBarShift)}
			>
				<Toolbar disableGutters={!open}>
					<IconButton
						color="inherit"
						aria-label="open drawer"
						onClick={handleDrawerOpen}
						className={classNames(classes.menuButton, open && classes.hide)}
					>
						<MenuIcon />
					</IconButton>
					<div style={{ display: 'flex', margin: 'auto' }}>
						<Typography variant="title" color="inherit" noWrap>
							Scrbbl <i style={{ marginTop: '4px' }} className="fab fa-lastfm" />
						</Typography>
					</div>
					<UserNav displayName={displayName} />
				</Toolbar>
			</AppBar>
			<Drawer
				variant="permanent"
				classes={{
					paper: classNames(classes.drawerPaper, !open && classes.drawerPaperClose),
				}}
				open={open}
			>
				<div className={classes.toolbar}>
					<IconButton onClick={handleDrawerClose}>
						<ChevronLeftIcon />
					</IconButton>
				</div>
				<Divider />
				<SideDrawerList closeDrawer={() => setOpen(false)} items={DrawerItems} />
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
					<Login authenticate={login} />
				}
			</main>
			<Snackbar
				anchorOrigin={{
					vertical: 'bottom',
					horizontal: 'left',
				}}
				open={showSnackbar}
				autoHideDuration={5000}
				onClose={handleSnackbarClose}
			>
				<SnackbarContent
					onClose={handleSnackbarClose}
					variant="success"
					message="Logged in successfully"
				/>
			</Snackbar>
		</div>
	);
}

export default withStyles(styles, { withTheme: true })(App);
