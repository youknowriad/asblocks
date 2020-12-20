import { matchPath, useHistory } from 'react-router';
import { Button, TextControl, Notice } from '@wordpress/components';
import { useRef, useState } from '@wordpress/element';

export function DocumentOpen( { onOpen } ) {
	const history = useHistory();
	const inputRef = useRef();
	const [ hasError, setHasError ] = useState( false );
	const submit = ( event ) => {
		event.preventDefault();
		const link = inputRef.current.value;
		try {
			const url = new URL( link );
			const pathname =
				url.pathname === '/'
					? url.hash.substring( 1, url.hash.indexOf( '#key=' ) )
					: url.pathname;
			const stringKey = link.substring( link.indexOf( '#key=' ) + 5 );
			if ( link ) {
				const matchRead = matchPath( pathname, {
					path: '/read/:id',
					exact: true,
					strict: false,
				} );
				const matchWrite = matchPath( pathname, {
					path: '/write/:id/:ownerKey',
					exact: true,
					strict: false,
				} );

				if ( matchWrite ) {
					history.push(
						`/write/${ matchWrite.params.id }/${ matchWrite.params.ownerKey }#key=` +
							stringKey
					);
					onOpen();
					return;
				} else if ( matchRead ) {
					history.push(
						`/read/${ matchRead.params.id }#key=` + stringKey
					);
					onOpen();
					return;
				}
			}
		} catch ( error ) {}

		setHasError( true );
	};

	return (
		<form onSubmit={ submit }>
			{ hasError && (
				<Notice status="error">This link can not be opened.</Notice>
			) }
			<TextControl
				ref={ inputRef }
				label="Link"
				placeholder="https://"
				onChange={ () => setHasError( false ) }
			/>
			<Button isPrimary type="submit">
				Open
			</Button>
		</form>
	);
}
