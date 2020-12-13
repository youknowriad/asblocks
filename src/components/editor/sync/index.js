import { useEffect, useState, useRef } from '@wordpress/element';
import { useSelect, useDispatch } from '@wordpress/data';
import io from 'socket.io-client';
import { encrypt, decrypt } from '../../../lib/crypto';
import { config } from '../../../config/index';
import { postDocToObject, updatePostDoc } from './algorithms/yjs';
import { createDocument } from '../../../lib/yjs-doc';

export function useSyncEdits( encryptionKey, ownerKey ) {
	const [ isEditable, setIsEditable ] = useState( false );
	const [ isMaster, setIsMaster ] = useState( false );
	const doc = useRef();

	const {
		getSelectionStart,
		getSelectionEnd,
		editedPost,
		currentRoom,
	} = useSelect( ( select ) => {
		return {
			getSelectionStart: select( 'core/block-editor' ).getSelectionStart,
			getSelectionEnd: select( 'core/block-editor' ).getSelectionEnd,
			editedPost: select( 'asblocks' ).getEdited(),
			currentRoom: select( 'asblocks' ).getPersisted()._id,
		};
	}, [] );
	const {
		setPeerSelection,
		setAvailablePeers,
		edit,
		setSharedDoc,
	} = useDispatch( 'asblocks' );

	// This is just a way to use the current value in hooks
	// that don't change when the value changes.
	const currentPost = useRef( editedPost );
	currentPost.current = editedPost;

	useEffect( () => {
		if ( ! currentRoom ) {
			setIsEditable( true );
			return;
		}

		const socket = io( config.collabServer );
		let state = 'disconnected';
		let unsubscribe;

		socket.on( 'connect', () => {
			const sendSelection = async () => {
				socket.emit( 'server-broadcast', currentRoom, {
					ownerKey,
					action: await encrypt(
						{
							type: 'selection',
							identity: socket.id,
							selection: {
								start: getSelectionStart(),
								end: getSelectionEnd(),
							},
						},
						encryptionKey
					),
				} );
			};

			const sendDocMessage = async ( message ) => {
				socket.emit( 'server-broadcast', currentRoom, {
					ownerKey,
					action: await encrypt(
						{
							type: 'doc',
							message,
						},
						encryptionKey
					),
				} );

				// Send selection at the same time we send doc updates
				// It could be optimized per selection change but in general
				// it's related.
				sendSelection();
			};

			const initDoc = () => {
				doc.current = createDocument( {
					identity: socket.id,
					applyDataChanges: updatePostDoc,
					getData: postDocToObject,
					sendMessage: sendDocMessage,
				} );

				setSharedDoc( doc.current );

				// Subscribe to remote data changes
				const unsubscribeDataChange = doc.current.onRemoteDataChange(
					( changes ) => edit( changes, true )
				);

				const unsubscribeStateChange = doc.current.onStateChange(
					( newState ) => {
						if ( newState === 'on' ) {
							setIsEditable( true );
						} else {
							setIsEditable( false );
						}
					}
				);

				unsubscribe = () => {
					unsubscribeDataChange();
					unsubscribeStateChange();
				};
			};

			socket.on( 'init-room', () => {
				socket.emit( 'join-room', currentRoom );
			} );

			socket.on( 'first-in-room', () => {
				setIsMaster( true );
				if ( state !== 'disconnected' ) {
					return;
				}
				state = 'connected';
				if ( ! doc.current ) {
					initDoc();
				}
				doc.current.startSharing( currentPost.current );
			} );

			socket.on( 'room-user-change', ( newPeers ) => {
				setAvailablePeers( newPeers );
			} );

			socket.on( 'new-user', async () => {
				sendSelection();
			} );

			socket.on( 'welcome-in-room', async () => {
				if ( state !== 'disconnected' ) {
					return;
				}
				state = 'connected';
				if ( ! doc.current ) {
					initDoc();
				}
				doc.current.connect();
			} );

			// A message has been received
			socket.on( 'client-broadcast', async ( msg, socketId ) => {
				const action = await decrypt( msg, encryptionKey );

				// Ignore self messages
				if ( socketId === socket.id ) {
					return;
				}

				switch ( action.type ) {
					case 'doc': {
						doc.current.receiveMessage( action.message );
						break;
					}

					case 'selection': {
						setPeerSelection( action.identity, action.selection );
					}
				}
			} );

			socket.on( 'disconnect', () => {
				state = 'disconnected';
				if ( doc.current ) {
					doc.current.disconnect();
				}
			} );
		} );

		return () => {
			if ( unsubscribe ) {
				unsubscribe();
				doc.current = null;
				setSharedDoc( null );
			}
			socket.close();
		};
	}, [ currentRoom ] );

	// Local change handler
	async function editProperties( changes ) {
		const hasChanges = Object.entries( changes ).some(
			( [ key, value ] ) => value !== currentPost.current[ key ]
		);

		if ( ! hasChanges ) {
			return;
		}

		// This needs to be called synchronously
		// otherwise we might have selection jumps in the editor
		edit( changes );
	}

	return [ isEditable, editedPost, editProperties, isMaster ];
}
