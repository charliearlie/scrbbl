import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';

const styles = theme => ({
	root: {
		width: '100%',
		maxWidth: 360,
		backgroundColor: theme.palette.background.paper,
	},
});

const hiddenDrawerWidth = 600;

class SideDrawerList extends Component {
	constructor(props) {
		super(props);

		this.goTo = this.goTo.bind(this);
	}

	goTo(route) {
		if (window.innerWidth < hiddenDrawerWidth) {
			this.props.closeDrawer();
		}
		this.props.history.push(route);
	}

	render() {
		const { items, classes } = this.props;

		return (
			<div className={classes.root}>
				<List component="nav">
					{items.map(item => (
						<ListItem button key={item.text} onClick={() => this.goTo(item.route)}>
							<ListItemIcon>
								{item.icon}
							</ListItemIcon>
							<ListItemText>
								{item.text}
							</ListItemText>
						</ListItem>
					))}
				</List>
			</div>
		);
	}
}

export default withRouter(withStyles(styles, { withTheme: true })(SideDrawerList));
