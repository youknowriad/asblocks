import { useEffect } from '@wordpress/element';

const addBodyClass = ( className ) => document.body.classList.add( className );
const removeBodyClass = ( className ) =>
	document.body.classList.remove( className );

export function useBodyClass( className ) {
	useEffect( () => {
		addBodyClass( className );
		return () => removeBodyClass( className );
	}, [ className ] );
}
