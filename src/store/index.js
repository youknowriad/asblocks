/**
 * WordPress dependencies
 */
import { registerStore } from '@wordpress/data';

/**
 * Internal dependencies
 */
import reducer from './reducer';
import * as selectors from './selectors';
import * as actions from './actions';

/**
 * Module Constants
 */
const MODULE_KEY = 'asblocks';

const store = registerStore( MODULE_KEY, {
	reducer,
	selectors,
	actions,
} );

export default store;
