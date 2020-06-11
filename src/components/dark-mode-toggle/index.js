import { ToggleControl } from '@wordpress/components';
import { createLocalStorageStateHook } from 'use-local-storage-state';

export const useDarkMode = createLocalStorageStateHook( 'dark-mode', false );

export function DarkModeToggle() {
	const [ isDarkMode, setIsDarkMode ] = useDarkMode();
	return (
		<ToggleControl
			checked={ isDarkMode }
			label="Dark Mode"
			onChange={ ( value ) => setIsDarkMode( value ) }
		/>
	);
}
