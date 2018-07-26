import React from 'react';
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

const SideDrawerList = withRouter((props) => {
	const { items, classes } = props;

	return (
		<div className={classes.root}>
			<List component="nav">
				{items.map(item => (
					<ListItem button key={item.text} onClick={() => props.history.push(item.route)}>
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
});

export default withStyles(styles, { withTheme: true })(SideDrawerList);
