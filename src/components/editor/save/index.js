import { useDispatch, useSelect } from '@wordpress/data';
import { useEffect } from '@wordpress/element';
import { savePost } from '../../../api/posts';
import { keyToString } from '../../../lib/crypto';
import { useMutation } from '../../../lib/data';
import { useLocalPostSave } from '../../../local-storage';

function useAutosave( isEnabled, encryptionKey, ownerKey ) {
	const { isDirty, getEdits, getPersisted } = useSelect( ( select ) => {
		return {
			isDirty: select( 'asblocks' ).isDirty,
			getEdits: select( 'asblocks' ).getEdits,
			getPersisted: select( 'asblocks' ).getPersisted,
		};
	}, [] );
	const setLocalPost = useLocalPostSave();
	const { persist } = useDispatch( 'asblocks' );
	const { mutate: mutateSave, loading: isSaving } = useMutation( savePost );

	const triggerSave = async () => {
		const edits = getEdits();
		const { data: persisted } = await mutateSave(
			{ ...getPersisted(), ...edits },
			encryptionKey,
			ownerKey
		);
		persist( persisted, edits );
		const newStringKey = await keyToString( encryptionKey );
		setLocalPost( {
			_id: persisted._id,
			ownerKey,
			title: persisted.title,
			key: newStringKey,
		} );
	};

	useEffect( () => {
		if ( ! isEnabled ) {
			return;
		}
		const interval = setInterval( () => {
			if ( ! isSaving && isDirty() ) {
				triggerSave();
			}
		}, 5000 );

		return () => clearInterval( interval );
	}, [ isEnabled ] );
}

export default useAutosave;
