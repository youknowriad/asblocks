import { Inserter } from '@wordpress/block-editor';
import { Button } from '@wordpress/components';
import { cog, share } from '@wordpress/icons';
import { useSelect } from '@wordpress/data';
import { Logo } from '../../logo';
import { useMutation } from '../../../lib/data';
import { savePost, sharePost } from '../../../api/posts';
import { keyToString } from '../../../lib/crypto';
import './style.css';

export function EditorHeader( {
	persistedPost,
	editedPost,
	isInspectorOpened,
	onOpenInspector,
	encryptionKey,
	ownerKey,
	onPersist,
	setIsShareModalOpened,
} ) {
	const peersCount = useSelect(
		( select ) => Object.keys( select( 'asblocks' ).getPeers() ).length,
		[]
	);
	const { mutate: mutateShare, loading: isSharing } = useMutation(
		sharePost
	);
	const { mutate: mutateSave, loading: isSaving } = useMutation( savePost );

	const isShared = persistedPost.status === 'publish';
	const isDirty = editedPost !== persistedPost;

	const triggerSave = async () => {
		const { data: persisted } = await mutateSave(
			editedPost,
			encryptionKey,
			ownerKey
		);
		onPersist( persisted );
	};

	const triggerShare = async () => {
		const { data: persisted } = await mutateShare( ownerKey );
		const newStringKey = await keyToString( encryptionKey );
		onPersist( persisted );
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
