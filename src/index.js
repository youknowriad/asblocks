import React from 'react';
import { render } from 'react-dom';
import { App } from './components/app';
import './load-assets';
import './reset.css';
import './store';

render(
	<React.StrictMode>
		<App />
	</React.StrictMode>,
	document.body
);
