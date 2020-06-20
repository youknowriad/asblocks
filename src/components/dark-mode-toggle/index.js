import { ToggleControl } from '@wordpress/components';
import { useDarkMode } from '../../local-storage';

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
