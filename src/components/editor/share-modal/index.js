import { Modal, Button } from '@wordpress/components';
import { Icon, check, info } from '@wordpress/icons';
import { useRef } from '@wordpress/element';
import { useCopyOnClick } from '@wordpress/compose';
import './style.css';

export function ShareModal( { onClose, post, ownerKey, stringKey } ) {
	const editURL = `${ location.origin }/write/${ post._id }/${ ownerKey }#key=${ stringKey }`;
	const readURL = `${ location.origin }/read/${ post._id }#key=${ stringKey }`;
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
						the URL of this page with your collaborators.
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

				<div className="editor-share-modal__info">
					<Icon
						icon={ info }
						className="editor-share-modal__info-icon"
					/>{ ' ' }
					<p>
						By default, the content of your post is not persisted to
						the server. This means that if all the collaborators
						leave the page, the unsaved content will be lost. You
						can hover persist an encrypted version to the server at
						any time by clicking the &quot;Save&quot; button.
					</p>
				</div>
			</div>
		</Modal>
	);
}
