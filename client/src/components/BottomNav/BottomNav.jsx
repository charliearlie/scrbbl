import React from 'react';
import { withRouter } from 'react-router-dom';
import BottomNavigation from '@material-ui/core/BottomNavigation';
import BottomNavigationAction from '@material-ui/core/BottomNavigationAction';

function BottomNav({ items, location, history, styles }) {
	const changeRoute = path => {
		history.push(path);
	};

	return (
		<BottomNavigation value={location.pathname} className={styles} showLabels>
			{items.map(item => (
				<BottomNavigationAction
					label={item.shortText}
					value={item.route}
					icon={item.icon}
					onClick={() => changeRoute(item.route)}
				/>
			))}
		</BottomNavigation>
	);
}

export default withRouter(BottomNav);
