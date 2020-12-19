import { init, trackPages } from 'insights-js';
import * as Sentry from '@sentry/browser';
import React from 'react';
import { render } from 'react-dom';
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
	<React.StrictMode>
		<App />
	</React.StrictMode>,
	document.body.querySelector( '#root' )
);
