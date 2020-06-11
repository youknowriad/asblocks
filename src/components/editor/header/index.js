import { Inserter } from '@wordpress/block-editor';
import { Button } from '@wordpress/components';
import { useState } from '@wordpress/element';
import { cog, share } from '@wordpress/icons';
import usePromise from 'react-promise-suspense';
import { ShareModal } from '../share-modal';
import { Logo } from '../../logo';
import { useMutation } from '../../../lib/data';
import { savePost, sharePost } from '../../../api/posts';
import { keyToString } from '../../../lib/crypto';
import './style.css';

export function EditorHeader( {
	persistedPost,
	editedPost,
	peers,
	isInspectorOpened,
	onOpenInspector,
	encryptionKey,
	ownerKey,
	onPersist,
} ) {
	const stringKey = usePromise( keyToString, [ encryptionKey ] );
	const [ isShareModalOpened, setIsShareModalOpened ] = useState( false );
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
				{ peers.length > 1 && (
					<div className="editor__header-peers">
						<strong>{ peers.length }</strong> connected peers
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

			{ isShareModalOpened && (
				<ShareModal
					onClose={ () => setIsShareModalOpened( false ) }
					post={ persistedPost }
					stringKey={ stringKey }
					ownerKey={ ownerKey }
				/>
			) }
		</div>
	);
}
