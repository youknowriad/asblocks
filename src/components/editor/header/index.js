import { Inserter } from '@wordpress/block-editor';
import { Button } from '@wordpress/components';
import { cog, share } from '@wordpress/icons';
import { useSelect, useDispatch } from '@wordpress/data';
import { Logo } from '../../logo';
import { useMutation } from '../../../lib/data';
import { savePost, sharePost } from '../../../api/posts';
import { keyToString } from '../../../lib/crypto';
import './style.css';

export function EditorHeader( {
	//	persistedPost,
	//	editedPost,
	isInspectorOpened,
	onOpenInspector,
	setIsShareModalOpened,
	encryptionKey,
	ownerKey,
	//	onPersist,
} ) {
	const { peersCount, isShared, isDirty, getEdits, getPersisted } = useSelect(
		( select ) => {
			return {
				peersCount: Object.keys( select( 'asblocks' ).getPeers() )
					.length,
				isShared: select( 'asblocks' ).isShared(),
				isDirty: select( 'asblocks' ).isDirty(),
				getEdits: select( 'asblocks' ).getEdits,
				getPersisted: select( 'asblocks' ).getPersisted,
			};
		},
		[]
	);
	const { persist } = useDispatch( 'asblocks' );
	const { mutate: mutateShare, loading: isSharing } = useMutation(
		sharePost
	);
	const { mutate: mutateSave, loading: isSaving } = useMutation( savePost );

	const triggerSave = async () => {
		const edits = getEdits();
		const { data: persisted } = await mutateSave(
			{ ...getPersisted(), ...edits },
			encryptionKey,
			ownerKey
		);
		persist( persisted, edits );
	};

	const triggerShare = async () => {
		const { data: persisted } = await mutateShare( ownerKey );
		const newStringKey = await keyToString( encryptionKey );
		persist( persisted );
		window.history.replaceState(
			{ id: persisted._id },
			'Post ' + persisted._id,
			'/write/' + persisted._id + '/' + ownerKey + '#key=' + newStringKey
		);
		setIsShareModalOpened( true );
	};

	return (
		<div className="editor__header-content">
			<div className="editor__header-left">
				<div>
					<Logo />
				</div>

				<div>
					<Inserter
						position="bottom right"
						showInserterHelpPanel
						toggleProps={ { isPrimary: true } }
					/>
				</div>
			</div>
			<div className="editor__header-right">
				{ peersCount > 1 && (
					<div className="editor__header-peers">
						<strong>{ peersCount }</strong> connected peers
					</div>
				) }
				<div>
					<Button
						onClick={ isShared ? triggerSave : triggerShare }
						disabled={ ! isDirty || isSaving || isSharing }
						isBusy={ isSaving || isSharing }
						isPrimary
					>
						{ isShared ? 'Save' : 'Share' }
					</Button>
				</div>

				{ isShared && (
					<div>
						<Button
							icon={ share }
							label="Show sharing information"
							onClick={ () => setIsShareModalOpened( true ) }
						/>
					</div>
				) }

				{ ! isInspectorOpened && (
					<div>
						<Button
							icon={ cog }
							onClick={ onOpenInspector }
							label="Open Inspector"
						/>
					</div>
				) }
			</div>
		</div>
	);
}
