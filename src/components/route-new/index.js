import { useDispatch } from '@wordpress/data';
import { useEffect } from '@wordpress/element';
import { v4 as uuidv4 } from 'uuid';
import usePromise from 'react-promise-suspense';
import { Editor } from '../editor';
import { generateKey } from '../../lib/crypto';

export function RouteNew() {
	const encryptionKey = usePromise( generateKey, [] );
	const ownerKey = uuidv4();
	const post = {
		status: 'auto-draft',
	};
	const { persist } = useDispatch( 'asblocks' );
	useEffect( () => {
		persist( { status: 'auto-draft' } );
	}, [] );

	return (
		<Editor
			post={ post }
			encryptionKey={ encryptionKey }
			ownerKey={ ownerKey }
		/>
	);
}
