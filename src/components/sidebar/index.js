import { Button } from '@wordpress/components';
import { close } from '@wordpress/icons';
import { pure } from '@wordpress/compose';
import { DarkModeToggle } from '../dark-mode-toggle';
import { useIsSidebarOpened } from '../../local-storage';
import { ThemeSwitcher } from '../theme-switcher';
import { ModalToggle } from '../modal-toggle';
import { Documents } from '../documents';
import './style.css';

export const Sidebar = pure( () => {
	const [ , setIsSidebarOpened ] = useIsSidebarOpened();

	return (
		<div className="sidebar">
			<div className="sidebar__close">
				<Button
					icon={ close }
					onClick={ () => setIsSidebarOpened( false ) }
					label="Close Inspector"
				/>
			</div>

			<div className="sidebar__menu">
				<Documents />
			</div>

			<div className="sidebar__footer">
				<ModalToggle
					title="About AsBlocks"
					renderToggle={ ( { onToggle, isOpen } ) => (
						<Button
							onClick={ onToggle }
							aria-haspopup="true"
							aria-expanded={ isOpen }
							isTertiary
						>
							About AsBlocks
						</Button>
					) }
					renderContent={ () => (
						<div className="sidebar__about">
							<strong>AsBlocks</strong> is an{ ' ' }
							<a href="https://en.wikipedia.org/wiki/End-to-end_encryption">
								end-to-end encrypted
							</a>{ ' ' }
							(private) collaborative writing environment powered
							by{ ' ' }
							<a href="https://github.com/WordPress/gutenberg">
								Gutenberg
							</a>{ ' ' }
							and{ ' ' }
							<a href="https://github.com/youknowriad/asblocks">
								you can contribute
							</a>
							.
						</div>
					) }
				/>

				<ModalToggle
					title="Preferences"
					renderToggle={ ( { onToggle, isOpen } ) => (
						<Button
							onClick={ onToggle }
							aria-haspopup="true"
							aria-expanded={ isOpen }
							isTertiary
						>
							Preferences
						</Button>
					) }
					renderContent={ () => (
						<div className="sidebar__preferences">
							<div className="sidebar__section">
								<h3>Options</h3>
								<DarkModeToggle />
							</div>

							<div className="sidebar__section">
								<ThemeSwitcher />
							</div>
						</div>
					) }
				/>
			</div>
		</div>
	);
} );
