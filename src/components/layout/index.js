import classnames from 'classnames';
import { Sidebar } from '../sidebar';
import { useIsSidebarOpened } from '../../local-storage';
import './style.css';

export function Layout( { children } ) {
	const [ isSidebarOpened ] = useIsSidebarOpened();
	return (
		<div
			className={ classnames( 'layout', {
				'is-sidebar-opened': isSidebarOpened,
			} ) }
		>
			<div className="layout__sidebar">
				<Sidebar />
			</div>
			<div className="layout__main">{ children }</div>
		</div>
	);
}
