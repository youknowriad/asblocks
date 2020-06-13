import { useEffect, useState, useRef } from '@wordpress/element';
import { useSelect, useDispatch } from '@wordpress/data';
import io from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';
import { encrypt, decrypt } from '../../../lib/crypto';
import { config } from '../../../config/index';
import { getPostDoc } from './algorithms/yjs';

export function useSyncEdits( initialPost, encryptionKey, ownerKey ) {
	const [ editedPost, setEditedPost ] = useState( initialPost );
	const identity = useRef( uuidv4() );
	const syncDoc = useRef();
	const isInitialized = useRef( false );
	const socket = useRef();

	const { peers, getSelectionStart, getSelectionEnd } = useSelect(
		( select ) => {
			return {
				peers: select( 'asblocks' ).getPeers(),
				getSelectionStart: select( 'core/block-editor' )
					.getSelectionStart,
				getSelectionEnd: select( 'core/block-editor' ).getSelectionEnd,
			};
		},
		[]
	);
	const { setPeers, setPeerSelection, setAvailablePeers } = useDispatch(
		'asblocks'
	);

	// Local change handler
	async function onChangePost( newPost ) {
		if ( newPost === editedPost ) {
			return;
		}

		// This needs to be called synchronously
		// otherwise we might have selection jumps in the editor
		setEditedPost( newPost );

		if ( ! syncDoc.current || newPost._id !== editedPost._id ) {
			syncDoc.current = getPostDoc( identity.current );
		}

		// Avoid persist changes in the doc until ready
		if ( isInitialized.current ) {
			syncDoc.current.applyPostChange( newPost, identity.current );
		}
	}

	useEffect( () => {
		if ( ! editedPost._id ) {
			return;
		}

		if ( ! syncDoc.current ) {
			syncDoc.current = getPostDoc( identity.current );
		}

		socket.current = io( config.collabServer );

		// Join the room on init
		socket.current.on( 'init-room', () => {
			socket.current.emit( 'join-room', editedPost._id );
		} );

		// Mark the scene as ready
		socket.current.on( 'first-in-room', () => {
			isInitialized.current = true;
			syncDoc.current.applyPostChange( editedPost, identity.current );
			socket.current.off( 'first-in-room' );
		} );

		// When a new user connects to the room, send the current post.
		socket.current.on( 'new-user', async () => {
			const update = syncDoc.current.getUpdate();
			socket.current.emit( 'server-broadcast', editedPost._id, {
				action: await encrypt(
					{
						type: 'init',
						identity: identity.current,
						peers: {
							...peers,
							[ socket.current.id ]: {
								start: getSelectionStart(),
								end: getSelectionEnd(),
							},
						},
						...update,
					},
					encryptionKey
				),
				ownerKey,
			} );
		} );

		// A message has been received
		socket.current.on( 'client-broadcast', async ( msg, socketId ) => {
			const action = await decrypt( msg, encryptionKey );
			// Ignore self messages
			if ( action.identity === identity.current ) {
				return;
			}

			switch ( action.type ) {
				// Update content
				case 'update': {
					if ( ! isInitialized.current ) {
						return;
					}

					setPeerSelection( socketId, action.selection );
					syncDoc.current.applyChangeFromUpdate(
						action,
						action.identity
					);
					break;
				}

				case 'init': {
					if ( isInitialized.current ) {
						return;
					}

					isInitialized.current = true;
					syncDoc.current.applyChangeFromUpdate(
						action,
						action.identity
					);
					setPeers( action.peers );
				}
			}
		} );

		socket.current.on( 'room-user-change', ( newPeers ) => {
			setAvailablePeers( newPeers );
		} );

		// When a local update is ready, send it to the world
		const unsubscribeLocalUpdate = syncDoc.current.onLocalUpdate(
			async ( update ) => {
				socket.current.emit( 'server-broadcast', editedPost._id, {
					action: await encrypt(
						{
							type: 'update',
							identity: identity.current,
							selection: {
								start: getSelectionStart(),
								end: getSelectionEnd(),
							},
							...update,
						},
						encryptionKey
					),
					ownerKey,
				} );
			}
		);

		// When the post is update from a remote, update it locally
		const unsubscribeRemoteUpdate = syncDoc.current.onRemotePostMerge(
			( newPost ) => {
				setEditedPost( newPost );
			}
		);

		return () => {
			socket.current.close();
			socket.current = null;
			setAvailablePeers( [] );
			unsubscribeLocalUpdate();
			unsubscribeRemoteUpdate();
		};
	}, [ editedPost._id ] );

	return [ editedPost, onChangePost ];
}
