import { useState } from 'react';

function useLocalStorage(key, initialValue) {
	const [storedValue, setStoredValue] = useState(() => {
		return window.localStorage.getItem(key) || initialValue;
	});

	const setValue = value => {
		if (value) {
			const valueToStore = value instanceof Function ? value(storedValue) : value;
			setStoredValue(valueToStore);

			window.localStorage.setItem(key, JSON.stringify(valueToStore));
		}
	};

	return [storedValue, setValue];
}

export default useLocalStorage;
