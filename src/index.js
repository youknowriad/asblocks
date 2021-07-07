import { init, trackPages } from 'insights-js';
import * as Sentry from '@sentry/browser';
import { render, StrictMode } from '@wordpress/element';
import { App } from './components/app';
import './load-assets';
import './reset.css';
import './store';
import { config } from './config/index';

if ( config.sentry ) {
	Sentry.init( { dsn: config.sentry, attachStacktrace: true } );
}

if ( config.insights ) {
	init( config.insights );
	trackPages();
}

render(
	<StrictMode>
		<App />
	</StrictMode>,
	document.body.querySelector( '#root' )
);
