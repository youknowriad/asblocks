import classnames from 'classnames';
import usePromise from 'react-promise-suspense';
import {
	BlockEditorKeyboardShortcuts,
	BlockEditorProvider,
	BlockList,
	WritingFlow,
	ObserveTyping,
	// eslint-disable-next-line
	__unstableUseTypewriter as useTypewriter,
} from '@wordpress/block-editor';
import { Popover, SlotFillProvider } from '@wordpress/components';
import { useState, useRef } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import { EditorHeader } from './header';
import { PostTitleEditor } from './post-title-editor';
import { Inspector } from './inspector';
import { Comments } from './comments';
import { useSyncEdits } from './sync/index';
import { keyToString } from '../../lib/crypto';
import { LoadingCanvas } from '../loading-canvas';
import useAutosave from './save';
import './filters';
import './formats';
import './style.css';

const blockEditorSettings = {
	__experimentalBlockPatterns: [],
	__experimentalBlockPatternCategories: [],
};

export function Editor( { encryptionKey, ownerKey } ) {
	const stringKey = usePromise( keyToString, [ encryptionKey ] );
	const isShared = useSelect( ( select ) => {
		return select( 'asblocks' ).isShared();
	}, [] );
	const [ isEditable, editedPost, edit, isMaster ] = useSyncEdits(
		encryptionKey,
		ownerKey
	);
	const ref = useRef();
	useTypewriter( ref );
	useAutosave( isShared && isMaster, encryptionKey, ownerKey );
	const [ isInspectorOpened, setIsInspectorOpened ] = useState( false );

	const getPropertyChangeHandler = ( property ) => ( value ) => {
		edit( {
			[ property ]: value,
		} );
	};

	return (
		<SlotFillProvider>
			<BlockEditorProvider
				settings={ blockEditorSettings }
				useSubRegistry={ false }
				value={ editedPost.blocks }
				onInput={ getPropertyChangeHandler( 'blocks' ) }
				onChange={ getPropertyChangeHandler( 'blocks' ) }
			>
				<div
					className={ classnames( 'editor', {
						'is-ready': isEditable,
						'is-inspector-opened': isInspectorOpened,
					} ) }
				>
					<Popover.Slot name="block-toolbar" />
					<div
						className="editor__main"
						ref={ ref }
						style={ {
							//necessary for typewriter effect
							paddingBottom: '40vh',
						} }
					>
						<div className="editor__header">
							<EditorHeader
								isEditable={ isEditable }
								encryptionKey={ encryptionKey }
								ownerKey={ ownerKey }
								isInspectorOpened={ isInspectorOpened }
								onOpenInspector={ () =>
									setIsInspectorOpened( true )
								}
								stringKey={ stringKey }
							/>
						</div>
						{ ! isEditable && <LoadingCanvas /> }
						<div className="editor__canvas">
							<div className="editor__info-sidebar"></div>
							<div className="editor__content editor-styles-wrapper">
								<BlockEditorKeyboardShortcuts />
								<WritingFlow>
									<div className="editor__post-title-wrapper">
										<PostTitleEditor
											value={ editedPost.title }
											onChange={ getPropertyChangeHandler(
												'title'
											) }
										/>
									</div>
									<ObserveTyping>
										<BlockList />
									</ObserveTyping>
								</WritingFlow>
								<Popover.Slot />
							</div>
							<div className="editor__comments-sidebar">
								<Comments comments={ editedPost.comments } />
							</div>
						</div>
					</div>
					{ isInspectorOpened && (
						<div className="editor__sidebar">
							<Inspector
								onClose={ () => setIsInspectorOpened( false ) }
							/>
						</div>
					) }
					<Popover.Slot />
				</div>
			</BlockEditorProvider>
		</SlotFillProvider>
	);
}
