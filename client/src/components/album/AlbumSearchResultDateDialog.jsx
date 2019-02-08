import React, { useState } from 'react';
import { MuiPickersUtilsProvider } from 'material-ui-pickers';
import moment from 'moment';
import { DateTimePicker } from 'material-ui-pickers';
// pick utils
import MomentUtils from '@date-io/moment';

function AlbumSearchResultDateDialog({ onChangeDate }) {
	const [selectedDate, setDate] = useState(new moment());

	const handleDateChange = date => {
		setDate(date);
		onChangeDate(date);
	};

	return (
		<MuiPickersUtilsProvider utils={MomentUtils}>
			<DateTimePicker value={selectedDate} onChange={handleDateChange} />
		</MuiPickersUtilsProvider>
	);
}

export default AlbumSearchResultDateDialog;
