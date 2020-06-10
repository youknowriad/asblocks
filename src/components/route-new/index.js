import { v4 as uuidv4 } from 'uuid';
import usePromise from 'react-promise-suspense';
import { Editor } from '../editor';
import { generateKey } from '../../lib/crypto';

export function RouteNew() {
	const { encryptionKey, encryptionKeyString } = usePromise(
		generateKey,
		[]
	);
	const ownerKey = uuidv4();
	const post = {
		status: 'auto-draft',
	};

	return (
		<Editor
			post={ post }
			encryptionKey={ encryptionKey }
			encryptionKeyString={ encryptionKeyString }
			ownerKey={ ownerKey }
		/>
	);
}
