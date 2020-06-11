import classnames from 'classnames';
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
import { useState } from '@wordpress/element';
import { EditorHeader } from './header';
import { PostTitleEditor } from './post-title-editor';
import { Inspector } from './inspector';
import { useSyncEdits } from './sync';
import './block-selections';
import './style.css';

export function Editor( { post, encryptionKey, ownerKey } ) {
	const [ persistedPost, setPersistedPost ] = useState( post );
	const [ editedPost, setEditedPost ] = useState( post );
	const [ isInspectorOpened, setIsInspectorOpened ] = useState( false );

	useSyncEdits( editedPost, setEditedPost, encryptionKey, ownerKey );

	const getPropertyChangeHandler = ( property ) => ( value ) => {
		setEditedPost( {
			...editedPost,
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
					<div className="editor">
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
