import { useEffect, useState, useRef } from '@wordpress/element';
import { useSelect, useDispatch } from '@wordpress/data';
import io from 'socket.io-client';
import { encrypt, decrypt } from '../../../lib/crypto';
import { config } from '../../../config/index';
import { postDocToObject, updatePostDoc } from './algorithms/yjs';
import { createDocument } from '../../../lib/yjs-doc';

export function useSyncEdits( initialPost, encryptionKey, ownerKey ) {
	const [ editedPost, setEditedPost ] = useState( initialPost );
	const [ currentRoom, setCurrentRoom ] = useState( initialPost._id );
	const doc = useRef();

	// This is just a way to use the current value in hooks
	// that don't change when the value changes.
	const currentPost = useRef( editedPost );
	currentPost.current = editedPost;

	const { getSelectionStart, getSelectionEnd } = useSelect( ( select ) => {
		return {
			getSelectionStart: select( 'core/block-editor' ).getSelectionStart,
			getSelectionEnd: select( 'core/block-editor' ).getSelectionEnd,
		};
	}, [] );
	const { setPeerSelection, setAvailablePeers } = useDispatch( 'asblocks' );

	useEffect( () => {
		if ( ! currentRoom ) {
			return;
		}

		const socket = io( config.collabServer );
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

			doc.current = createDocument( {
				identity: socket.id,
				applyDataChanges: updatePostDoc,
				getData: postDocToObject,
				sendMessage: sendDocMessage,
			} );

			socket.on( 'init-room', () => {
				socket.emit( 'join-room', currentRoom );
				doc.current.connect();
			} );

			socket.on( 'first-in-room', () => {
				doc.current.startSharing( currentPost.current );
				socket.off( 'first-in-room' );
			} );

			socket.on( 'room-user-change', ( newPeers ) => {
				setAvailablePeers( newPeers );
			} );

			socket.on( 'new-user', async () => {
				sendSelection();
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
				if ( doc.current ) {
					doc.current.disconnect();
				}
			} );

			socket.on( 'reconnect', () => {
				if ( doc.current ) {
					doc.current.connect();
				}
			} );

			// Subscribe to remote data changes
			unsubscribe = doc.current.onRemoteDataChange( ( newPost ) => {
				setEditedPost( newPost );
			} );
		} );

		return () => {
			if ( unsubscribe ) {
				unsubscribe();
				doc.current = null;
			}
			socket.close();
		};
	}, [ currentRoom ] );

	// Local change handler
	async function onChangePost( newPost ) {
		if ( newPost === editedPost ) {
			return;
		}

		if ( newPost._id !== currentRoom ) {
			setCurrentRoom( newPost._id );
		}

		// This needs to be called synchronously
		// otherwise we might have selection jumps in the editor
		setEditedPost( newPost );

		if ( doc.current && doc.current.getState() === 'on' ) {
			doc.current.applyDataChanges( newPost );
		}
	}

	return [ editedPost, onChangePost ];
}
