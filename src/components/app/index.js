import classnames from 'classnames';
import { BrowserRouter as Router, Route, useLocation } from 'react-router-dom';
import { Suspense, useLayoutEffect } from '@wordpress/element';
import { RouteNew } from '../route-new';
import { RouteWrite } from '../route-write';
import { RouteRead } from '../route-read';
import { clearCache } from '../../lib/data';
import { LoadingPage } from '../loading-page';
import { useDarkMode } from '../dark-mode-toggle';
import './style.css';

function ClearCacheOnNavigate() {
	const location = useLocation();
	useLayoutEffect( () => {
		clearCache();
	}, [ location ] );

	return null;
}

export function App() {
	const [ isDarkMode ] = useDarkMode();

	return (
		<div className={ classnames( 'app', { 'is-dark-theme': isDarkMode } ) }>
			<Router>
				<ClearCacheOnNavigate />

				<Suspense fallback={ <LoadingPage /> }>
					<Route path="/loading">
						<LoadingPage />
					</Route>
					<Route path="/write/:id/:ownerKey">
						<RouteWrite />
					</Route>

					<Route path="/read/:id">
						<RouteRead />
					</Route>

					<Route exact path="/">
						<RouteNew />
					</Route>
				</Suspense>
			</Router>
		</div>
	);
}
