import classnames from 'classnames';
import {
	BrowserRouter,
	HashRouter,
	Route,
	useLocation,
} from 'react-router-dom';
import isElectron from 'is-electron';
import { Suspense, useLayoutEffect } from '@wordpress/element';
import { RouteNew } from '../route-new';
import { RouteWrite } from '../route-write';
import { RouteRead } from '../route-read';
import { clearCache } from '../../lib/data';
import { useDarkMode, useTheme } from '../../local-storage';
import { LoadingPage } from '../loading-page';
import { UpdateNotice } from '../update-notice';
import { useBodyClass } from '../../lib/hooks';
import { Layout } from '../layout';
import './style.css';

const Router = isElectron() ? HashRouter : BrowserRouter;

function ClearCacheOnNavigate() {
	const location = useLocation();
	useLayoutEffect( () => {
		clearCache();
	}, [ location ] );

	return null;
}

export function App() {
	const [ isDarkMode ] = useDarkMode();
	const [ theme ] = useTheme();
	useBodyClass( 'is-theme-' + theme );

	return (
		<div
			className={ classnames( 'app', {
				'is-dark-theme': isDarkMode,
			} ) }
		>
			<Router>
				<ClearCacheOnNavigate />
				<Layout>
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
				</Layout>
			</Router>

			<div className="app__notices">
				<UpdateNotice />
			</div>
		</div>
	);
}
