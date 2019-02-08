import React from 'react';
import { MuiPickersUtilsProvider, DateTimePicker } from 'material-ui-pickers';
// pick utils
import MomentUtils from '@date-io/moment';

function AlbumSearchResultDateDialog({ selectedDate, onChangeDate }) {
	const handleDateChange = date => {
		onChangeDate(date);
	};

	return (
		<MuiPickersUtilsProvider utils={MomentUtils}>
			<DateTimePicker value={selectedDate} onChange={handleDateChange} />
		</MuiPickersUtilsProvider>
	);
}

export default AlbumSearchResultDateDialog;
