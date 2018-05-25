import React, { Component } from 'react';

import IconButton from '@material-ui/core/IconButton';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';
import AccountCircle from '@material-ui/icons/AccountCircle';

class UserNav extends Component {
	constructor(props) {
		super(props);

		this.state = {
			anchorEl: null,
		};

		this.handleProfileMenu = this.handleProfileMenu.bind(this);
		this.handleProfileMenuClose = this.handleProfileMenuClose.bind(this);
	}

	handleProfileMenu(event) {
		this.setState({ anchorEl: event.currentTarget });
	}

	handleProfileMenuClose() {
		this.setState({ anchorEl: null });
	}

	render() {
		const open = Boolean(this.state.anchorEl);

		return (
			<div>
				<IconButton
					aria-owns={open ? 'menu-appbar' : null}
					aria-haspopup="true"
					onClick={this.handleProfileMenu}
					color="inherit"
				>
					<AccountCircle />
				</IconButton>
				<Menu
					id="menu-appbar"
					anchorEl={this.state.anchorEl}
					anchorOrigin={{
						vertical: 'top',
						horizontal: 'right',
					}}
					transformOrigin={{
						vertical: 'top',
						horizontal: 'right',
					}}
					open={open}
					onClose={this.handleProfileMenuClose}
				>
					<MenuItem onClick={this.handleProfileMenuClose}>{this.props.displayName}</MenuItem>
					<MenuItem onClick={this.logOut}>Log out</MenuItem>
				</Menu>
			</div>
		);
	}
}

export default UserNav;
