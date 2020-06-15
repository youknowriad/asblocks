import classnames from 'classnames';
import usePromise from 'react-promise-suspense';
import {
	BlockEditorKeyboardShortcuts,
	BlockEditorProvider,
	BlockList,
	WritingFlow,
	ObserveTyping,
} from '@wordpress/block-editor';
import {
	Popover,
	SlotFillProvider,
	DropZoneProvider,
} from '@wordpress/components';
import { useState, useRef } from '@wordpress/element';
import { EditorHeader } from './header';
import { PostTitleEditor } from './post-title-editor';
import { Inspector } from './inspector';
import { useSyncEdits } from './sync/index';
import { ShareModal } from './share-modal';
import { LoadingPage } from '../loading-page';
import { keyToString } from '../../lib/crypto';
import './block-selections';
import './style.css';

export function Editor( { post, encryptionKey, ownerKey } ) {
	const stringKey = usePromise( keyToString, [ encryptionKey ] );
	const [ isShareModalOpened, setIsShareModalOpened ] = useState( false );
	const [ isEditable, editedPost, setEditedPost ] = useSyncEdits(
		post,
		encryptionKey,
		ownerKey
	);
	const [ persistedPost, setPersistedPost ] = useState( post );
	const [ isInspectorOpened, setIsInspectorOpened ] = useState( false );

	// This is in theory not needed but it seems
	// BlockEditorProvider is buggy and sometimes,
	// it calls old onChange handlers. Using a ref
	// ensures that we're using the most up to date
	// editedPost value.
	const editedPostRef = useRef( post );
	editedPostRef.current = editedPost;
	const getPropertyChangeHandler = ( property ) => ( value ) => {
		setEditedPost( {
			...editedPostRef.current,
			[ property ]: value,
		} );
	};

	return (
		<SlotFillProvider>
			<DropZoneProvider>
				<BlockEditorProvider
					useSubRegistry={ false }
					value={ editedPost.blocks || [] }
					onInput={ getPropertyChangeHandler( 'blocks' ) }
					onChange={ getPropertyChangeHandler( 'blocks' ) }
				>
					{ isShareModalOpened && (
						<ShareModal
							onClose={ () => setIsShareModalOpened( false ) }
							post={ persistedPost }
							stringKey={ stringKey }
							ownerKey={ ownerKey }
						/>
					) }
					{ ! isEditable && <LoadingPage /> }
					<div
						className={ classnames( 'editor', {
							'is-ready': isEditable,
						} ) }
					>
						<div className="editor__main">
							<div
								className={ classnames( 'editor__header', {
									'is-inspector-opened': isInspectorOpened,
								} ) }
							>
								<EditorHeader
									encryptionKey={ encryptionKey }
									ownerKey={ ownerKey }
									persistedPost={ persistedPost }
									editedPost={ editedPost }
									isInspectorOpened={ isInspectorOpened }
									onOpenInspector={ () =>
										setIsInspectorOpened( true )
									}
									onPersist={ ( newPersistedPost ) => {
										setPersistedPost( newPersistedPost );
										setEditedPost( {
											...editedPost,
											_id: newPersistedPost._id,
											status: newPersistedPost.status,
										} );
									} }
									setIsShareModalOpened={
										setIsShareModalOpened
									}
								/>
							</div>
							<Popover.Slot name="block-toolbar" />
							<div className="editor-styles-wrapper editor__canvas">
								<div className="editor__post-title-wrapper">
									<PostTitleEditor
										value={ editedPost.title }
										onChange={ getPropertyChangeHandler(
											'title'
										) }
									/>
								</div>
								<BlockEditorKeyboardShortcuts />
								<WritingFlow>
									<ObserveTyping>
										<BlockList />
									</ObserveTyping>
								</WritingFlow>
								<Popover.Slot />
							</div>
						</div>
						{ isInspectorOpened && (
							<div className="editor__sidebar">
								<Inspector
									onClose={ () =>
										setIsInspectorOpened( false )
									}
								/>
							</div>
						) }
						<Popover.Slot />
					</div>
				</BlockEditorProvider>
			</DropZoneProvider>
		</SlotFillProvider>
	);
}
