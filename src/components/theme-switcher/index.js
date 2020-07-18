import { Button, VisuallyHidden } from '@wordpress/components';
import { check, Icon } from '@wordpress/icons';
import { useTheme } from '../../local-storage';
import './style.css';

const themes = [
	{
		name: 'modern',
		label: 'Modern',
		primary: '#3858e9',
		secondary: '#f6e776',
	},
	{
		name: 'coffee',
		label: 'Coffee',
		primary: '#5C1F0E',
		secondary: '#FD83A5',
	},
	{
		name: 'garden',
		label: 'Garden',
		primary: '#1A503D',
		secondary: '#F29C0B',
	},
	{
		name: 'midnight',
		label: 'Midnight',
		primary: '#b61264',
		secondary: '#cd87e3',
	},
	{
		name: 'ocean',
		label: 'Ocean',
		primary: '#4DAABE',
		secondary: '#DED4CC',
	},
];

export function ThemeSwitcher() {
	const [ selectedTheme, setTheme ] = useTheme();

	return (
		<div>
			<h3>Colors</h3>
			<div className="theme-switcher__content">
				{ themes.map( ( theme ) => (
					<Button
						key={ theme.name }
						className="theme-switcher__button"
						showTooltip
						label={ theme.label }
						onClick={ () => setTheme( theme.name ) }
					>
						<VisuallyHidden>{ theme.label }</VisuallyHidden>
						{ selectedTheme === theme.name && (
							<span className="theme-switcher__selected">
								<Icon icon={ check } />
							</span>
						) }
						<span
							className="theme-switcher__primary"
							style={ { backgroundColor: theme.primary } }
						/>
						<span
							className="theme-switcher__secondary"
							style={ { backgroundColor: theme.secondary } }
						/>
					</Button>
				) ) }
			</div>
		</div>
	);
}
