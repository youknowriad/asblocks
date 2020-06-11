import Emitter from 'tiny-emitter';
import { useState, useCallback, useEffect } from '@wordpress/element';

export const convertArgsToBase64 = ( args ) => {
	return Buffer.from( JSON.stringify( args ) ).toString( 'base64' );
};

const defaultArgs = [];
let promiseCache = new WeakMap();
const cacheEmitter = new Emitter();
function getCachedPromise( wrappedFetch, args = defaultArgs ) {
	const argsKey = convertArgsToBase64( args );
	if ( ! promiseCache.get( wrappedFetch ) ) {
		promiseCache.set( wrappedFetch, new Map() );
	}
	if ( ! promiseCache.get( wrappedFetch ).get( argsKey ) ) {
		promiseCache
			.get( wrappedFetch )
			.set( argsKey, wrappedFetch.fetch( ...args ) );
	}

	return promiseCache.get( wrappedFetch ).get( argsKey );
}

function getResourceFromPromise( promise ) {
	if ( ! promise.status ) {
		promise.status = 'pending';
		promise.suspender = promise.then(
			( r ) => {
				promise.status = 'success';
				promise.result = r;
			},
			( e ) => {
				// eslint-disable-next-line no-console
				console.error( 'error', e );
				promise.status = 'error';
				promise.result = e;
			}
		);
	}

	return {
		read() {
			if ( promise.status === 'pending' ) {
				throw promise.suspender;
			} else if ( promise.status === 'error' ) {
				throw promise.result;
			} else if ( promise.status === 'success' ) {
				return promise.result;
			}
		},
	};
}

export function useSuspendedApi( wrappedFetch, args ) {
	const [ , dispatch ] = useState( {} );
	const promise = getCachedPromise( wrappedFetch, args );
	const resource = getResourceFromPromise( promise );

	useEffect( () => {
		const reset = () => {
			dispatch( {} );
		};
		cacheEmitter.on( 'clear', reset );
		return () => cacheEmitter.off( 'clear', reset );
	}, [] );

	return resource.read();
}

const defaultMutationState = {
	loading: false,
	error: false,
	data: undefined,
};
export function useMutation( wrappedFetch ) {
	const [ mutationState, setMutationState ] = useState(
		defaultMutationState
	);

	useEffect( () => {
		setMutationState( defaultMutationState );
	}, [ wrappedFetch ] );

	const mutate = useCallback(
		async ( ...args ) => {
			let currentState = {
				...mutationState,
				loading: true,
			};
			setMutationState( currentState );
			try {
				const data = await wrappedFetch.fetch( ...args );
				currentState = {
					loading: false,
					error: false,
					data,
				};
			} catch ( error ) {
				currentState = {
					loading: false,
					error,
					data: undefined,
				};
			}
			setMutationState( currentState );
			return currentState;
		},
		[ wrappedFetch ]
	);

	return { ...mutationState, mutate };
}

export function clearCache() {
	promiseCache = new WeakMap();
	cacheEmitter.emit( 'clear' );
}
