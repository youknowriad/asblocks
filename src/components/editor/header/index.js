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
import { ModalToggle } from '../../modal-toggle';
import { ShareModal } from '../share-modal';

export function EditorHeader( {
	isInspectorOpened,
	onOpenInspector,
	encryptionKey,
	ownerKey,
	stringKey,
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
	const triggerShare = async ( openModal ) => {
		const { data: persisted } = await mutateShare( ownerKey );
		const newStringKey = await keyToString( encryptionKey );
		persist( persisted );
		window.history.replaceState(
			{ id: persisted._id },
			'Post ' + persisted._id,
			'/write/' + persisted._id + '/' + ownerKey + '#key=' + newStringKey
		);
		openModal();
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
					<div>
						<ModalToggle
							title="Sharing information"
							renderToggle={ ( { onToggle, isOpen } ) =>
								! isShared ? (
									<Button
										onClick={ () =>
											triggerShare( onToggle )
										}
										disabled={ isSharing }
										isBusy={ isSharing }
										isPrimary
										aria-haspopup="true"
										aria-expanded={ isOpen }
									>
										{ 'Share' }
									</Button>
								) : (
									<Button
										icon={ share }
										label="Show sharing information"
										onClick={ onToggle }
										aria-haspopup="true"
										aria-expanded={ isOpen }
									/>
								)
							}
							renderContent={ () => (
								<ShareModal
									stringKey={ stringKey }
									ownerKey={ ownerKey }
								/>
							) }
						/>
					</div>

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
