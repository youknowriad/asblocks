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
import { useState } from '@wordpress/element';
import { EditorHeader } from './header';
import { PostTitleEditor } from './post-title-editor';
import { Inspector } from './inspector';
import { Comments } from './comments';
import { useSyncEdits } from './sync/index';
import { ShareModal } from './share-modal';
import { LoadingPage } from '../loading-page';
import { keyToString } from '../../lib/crypto';
import './filters';
import './formats';
import './style.css';

export function Editor( { encryptionKey, ownerKey } ) {
	const stringKey = usePromise( keyToString, [ encryptionKey ] );
	const [ isEditable, editedPost, edit ] = useSyncEdits(
		encryptionKey,
		ownerKey
	);
	const [ isShareModalOpened, setIsShareModalOpened ] = useState( false );
	const [ isInspectorOpened, setIsInspectorOpened ] = useState( false );

	const getPropertyChangeHandler = ( property ) => ( value ) => {
		edit( {
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
									isInspectorOpened={ isInspectorOpened }
									onOpenInspector={ () =>
										setIsInspectorOpened( true )
									}
									setIsShareModalOpened={
										setIsShareModalOpened
									}
								/>
							</div>
							<div className="editor__canvas">
								<div className="editor__info-sidebar"></div>
								<div className="editor__content editor-styles-wrapper">
									<Popover.Slot name="block-toolbar" />
									<BlockEditorKeyboardShortcuts />
									<WritingFlow>
										<ObserveTyping>
											<div className="editor__post-title-wrapper">
												<PostTitleEditor
													value={ editedPost.title }
													onChange={ getPropertyChangeHandler(
														'title'
													) }
												/>
											</div>
											<BlockList />
										</ObserveTyping>
									</WritingFlow>
									<Popover.Slot />
								</div>
								<div className="editor__comments-sidebar">
									<Comments
										comments={ editedPost.comments }
									/>
								</div>
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
