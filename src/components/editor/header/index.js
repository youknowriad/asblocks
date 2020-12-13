import { Inserter } from '@wordpress/block-editor';
import { Button } from '@wordpress/components';
import { cog, share } from '@wordpress/icons';
import { useSelect, useDispatch } from '@wordpress/data';
import { Logo } from '../../logo';
import { useMutation } from '../../../lib/data';
import { sharePost } from '../../../api/posts';
import { keyToString } from '../../../lib/crypto';
import './style.css';
import { useLocalPostSave } from '../../../local-storage';

export function EditorHeader( {
	isInspectorOpened,
	onOpenInspector,
	setIsShareModalOpened,
	encryptionKey,
	ownerKey,
	isEditable,
} ) {
	const { peersCount, isShared } = useSelect( ( select ) => {
		return {
			peersCount: Object.keys( select( 'asblocks' ).getPeers() ).length,
			isShared: select( 'asblocks' ).isShared(),
		};
	}, [] );
	const setLocalPost = useLocalPostSave();
	const { persist } = useDispatch( 'asblocks' );
	const { mutate: mutateShare, loading: isSharing } = useMutation(
		sharePost
	);
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
		setLocalPost( {
			_id: persisted._id,
			ownerKey,
			title: persisted.title,
			key: newStringKey,
		} );
	};

	return (
		<div className="editor__header-content">
			<div className="editor__header-left">
				<div>
					<Logo />
				</div>

				{ isEditable && (
					<div>
						<Inserter
							position="bottom right"
							showInserterHelpPanel={ false }
							toggleProps={ { isPrimary: true } }
						/>
					</div>
				) }
			</div>
			{ isEditable && (
				<div className="editor__header-right">
					{ peersCount > 1 && (
						<div className="editor__header-peers">
							<strong>{ peersCount }</strong> connected peers
						</div>
					) }
					{ ! isShared && (
						<div>
							<Button
								onClick={ triggerShare }
								disabled={ isSharing }
								isBusy={ isSharing }
								isPrimary
							>
								{ 'Share' }
							</Button>
						</div>
					) }

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
			) }
		</div>
	);
}
