import { Modal, Button, TextControl } from '@wordpress/components';
import { Icon, check } from '@wordpress/icons';
import { useRef } from '@wordpress/element';
import { useCopyOnClick } from '@wordpress/compose';
import { useSelect } from '@wordpress/data';
import './style.css';
import { useAuthorName } from '../../../local-storage';

export function ShareModal( { onClose, ownerKey, stringKey } ) {
	const [ authorName, setAuthorName ] = useAuthorName();
	const postId = useSelect(
		( select ) => select( 'asblocks' ).getPersisted()._id,
		[]
	);
	const editURL = `${ window.location.origin }/write/${ postId }/${ ownerKey }#key=${ stringKey }`;
	const readURL = `${ window.location.origin }/read/${ postId }#key=${ stringKey }`;
	const editButton = useRef();
	const readButton = useRef();
	const isCopiedEdit = useCopyOnClick( editButton, editURL );
	const isCopiedRead = useCopyOnClick( readButton, readURL );

	return (
		<Modal title="Sharing information" onRequestClose={ onClose }>
			<div className="editor-share-modal__links">
				<div>
					<h3>Write</h3>
					<p>
						A live collaboration session is now in progress. Share
						the URL of this page with your collaborators. Your
						document is autosaved every 5 seconds.
					</p>
					<div className="editor-share-modal__copy">
						<input type="text" readOnly value={ editURL } />
						<Button ref={ editButton } isPrimary>
							{ isCopiedEdit ? 'Copied!' : 'Copy' }
						</Button>
					</div>
				</div>

				<div>
					<h3>Read</h3>
					<p>
						This is a read-only link where people are able to read
						the persisted document without edit rights.
					</p>
					<div className="editor-share-modal__copy">
						<input type="text" readOnly value={ readURL } />
						<Button ref={ readButton } isPrimary>
							{ isCopiedRead ? 'Copied!' : 'Copy' }
						</Button>
					</div>
				</div>
			</div>

			<div className="editor-share-modal__name">
				<TextControl
					label="Your Name"
					value={ authorName }
					onChange={ setAuthorName }
					help="Identify yourself on the collaborative discussions."
				/>
			</div>

			<div className="editor-share-modal__footer">
				<div className="editor-share-modal__info">
					<Icon
						icon={ check }
						className="editor-share-modal__e2e-icon"
					/>{ ' ' }
					<p>
						AsBlocks uses{ ' ' }
						<a href="https://en.wikipedia.org/wiki/End-to-end_encryption">
							end-to-end encryption
						</a>
						. This means that only the users accessing the post
						using the link above are able to access its content.
						AsBlocks&apos; server can not decrypt the content of
						your post either.
					</p>
				</div>
			</div>
		</Modal>
	);
}
