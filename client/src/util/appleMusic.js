import axios from 'axios';
import Config from '../config/endpoints';

export async function search(query, entity = 'song') {
	const response = await axios.get(
		`${Config.endpoints.albumSearch}?term=${query.replace(
			' ',
			'+',
		)}&media=music&entity=${entity}`,
	);
	return entity === 'album' ? response.data.results : response.data.results[0];
}

export default {
	search,
};
