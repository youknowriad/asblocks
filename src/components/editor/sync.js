import {
	isShallowEqualArrays,
	isShallowEqualObjects,
} from '@wordpress/is-shallow-equal';
import { useEffect, useRef, useState } from '@wordpress/element';
import { useSelect, useDispatch } from '@wordpress/data';
import io from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';
import { encrypt, decrypt } from '../../lib/crypto';
import { config } from '../../config/index';

export const getBlocksMap = ( blocks = [] ) =>
	blocks.reduce( ( map, block, index ) => {
		map[ block.clientId ] = { block, index };

		return {
			...map,
			...getBlocksMap( block.innerBlocks ),
		};
	}, {} );

export function getBlockVersions( currentVersions = {}, oldBlocks, newBlocks ) {
	if ( oldBlocks === newBlocks ) {
		return currentVersions;
	}

	const oldBlocksMap = getBlocksMap( oldBlocks );
	const newVersions = { ...currentVersions };

	const fillVersions = ( blocks = [] ) => {
		blocks.forEach( ( block ) => {
			if ( ! currentVersions[ block.clientId ] ) {
				newVersions[ block.clientId ] = { version: 1, nonce: uuidv4() };
			} else if (
				block.attributes !==
				oldBlocksMap[ block.clientId ].block.attributes
			) {
				newVersions[ block.clientId ] = {
					version: currentVersions[ block.clientId ].version + 1,
					nonce: uuidv4(),
				};
			}
			if (
				! currentVersions[ block.clientId ] ||
				block.innerBlocks !==
					oldBlocksMap[ block.clientId ].block.innerBlocks
			) {
				fillVersions( block.innerBlocks );
			}
		} );
	};

	fillVersions( newBlocks );

	return newVersions;
}

export function getPositionVersions(
	currentVersions = {},
	oldBlocks = [],
	newBlocks = [],
	parent = ''
) {
	if ( oldBlocks === newBlocks ) {
		return currentVersions;
	}

	currentVersions = { ...currentVersions };

	const oldBlocksMap = getBlocksMap( oldBlocks );
	const getBlockIds = ( blocks ) => blocks.map( ( block ) => block.clientId );
	if ( ! currentVersions[ parent ] ) {
		currentVersions[ parent ] = { version: 1, nonce: uuidv4() };
	} else if (
		! isShallowEqualArrays(
			getBlockIds( newBlocks ),
			getBlockIds( oldBlocks )
		)
	) {
		currentVersions[ parent ] = {
			version: currentVersions[ parent ].version + 1,
			nonce: uuidv4(),
		};
	}

	newBlocks.forEach( ( block ) => {
		const oldInnerBlocks = oldBlocksMap[ block.clientId ]
			? oldBlocksMap[ block.clientId ].block.innerBlocks
			: [];
		currentVersions = getPositionVersions(
			currentVersions,
			oldInnerBlocks,
			block.innerBlocks,
			block.clientId
		);
	} );

	return currentVersions;
}

export function getDeletedBlocks( oldBlocks, newBlocks ) {
	const deletedBlocks = {};
	const newBlocksMap = getBlocksMap( newBlocks );

	const checkDeletedBlocks = ( blocks = [] ) => {
		blocks.forEach( ( block ) => {
			if ( ! newBlocksMap.hasOwnProperty( block.clientId ) ) {
				deletedBlocks[ block.clientId ] = true;
			}
			checkDeletedBlocks( block.innerBlocks );
		} );
	};
	checkDeletedBlocks( oldBlocks );

	return deletedBlocks;
}

export function pickBlock(
	blockA,
	blockB,
	versionA,
	versionB,
	hasInnerBlockChanges,
	innerBlocks
) {
	const [ pick ] = compareVersions( blockA, blockB, versionA, versionB );
	const version = blockA === pick ? versionA : versionB;
	const block = hasInnerBlockChanges
		? {
				...pick,
				innerBlocks,
		  }
		: pick;

	return { block, version };
}

export function compareVersions( valueA, valueB, versionA, versionB ) {
	if ( ! versionA ) {
		return [ valueB, valueA ];
	}

	if ( ! versionB ) {
		return [ valueA, valueB ];
	}

	// If the local block is more recent (bigger version)
	// or remote and local blocks have the same version and nonces
	if (
		versionA.version > versionB.version ||
		( versionA.version === versionB.version &&
			versionA.nonce === versionB.nonce )
	) {
		return [ valueA, valueB ];
	}

	// Both local and remote blocks have updates, reconcile the conflict deterministically.
	// resolve conflicting edits deterministically by taking the one with the lowest versionNonce
	if (
		versionA.version === versionB.version &&
		versionA.nonce !== versionB.nonce
	) {
		if ( versionA.nonce < versionB.nonce ) {
			return [ valueA, valueB ];
		}

		return [ valueB, valueA ];
	}

	return [ valueB, valueA ];
}

const reconcileBlocks = (
	blocksA = [],
	blocksB = [],
	mapA,
	mapB,
	blockVersionsA,
	blockVersionsB,
	positionVersionA,
	positionVersionB,
	deletedBlocks,
	currentId = ''
) => {
	const [ primaryBlocks, secondaryBlocks ] = compareVersions(
		blocksA,
		blocksB,
		positionVersionA[ currentId ],
		positionVersionB[ currentId ]
	);
	const shouldSwitch = primaryBlocks === blocksB;
	const primaryMap = ! shouldSwitch ? mapA : mapB;
	const secondaryMap = shouldSwitch ? mapA : mapB;
	const primaryVersions = ! shouldSwitch ? blockVersionsA : blockVersionsB;
	const secondaryVersions = shouldSwitch ? blockVersionsA : blockVersionsB;
	const primaryPositionVersions = ! shouldSwitch
		? positionVersionA
		: positionVersionB;
	const secondaryPositionVersions = shouldSwitch
		? positionVersionA
		: positionVersionB;

	let hasChanges =
		blocksA.length !== blocksB.length || primaryBlocks !== blocksA;
	let newVersions = {};
	const alreadyAddedBlocks = {};
	let newBlocks = primaryBlocks.reduce( ( blocks, block ) => {
		alreadyAddedBlocks[ block.clientId ] = true;

		// If the remote block has been deleted locally.
		if ( deletedBlocks[ block.clientId ] ) {
			return blocks;
		}

		// If the remote block is a new block
		if ( ! secondaryMap.hasOwnProperty( block.clientId ) ) {
			blocks.push( block );
			newVersions[ block.clientId ] = primaryVersions[ block.clientId ];
			hasChanges = hasChanges || block !== mapA[ block.clientId ].block;
			return blocks;
		}

		// Reconcile nested blocks
		const {
			blocks: innerBlocks,
			versions: innerBlocksVersions,
			hasChanges: hasInnerBlockChanges,
		} = reconcileBlocks(
			secondaryMap[ block.clientId ].block.innerBlocks,
			block.innerBlocks,
			secondaryMap,
			primaryMap,
			secondaryVersions,
			primaryVersions,
			secondaryPositionVersions,
			primaryPositionVersions,
			deletedBlocks,
			block.clientId
		);
		newVersions = {
			...newVersions,
			...innerBlocksVersions,
		};

		// Pick a block depending on the version
		// and apply the right inner blocks
		const { block: newBlock, version: newVersion } = pickBlock(
			secondaryMap[ block.clientId ].block,
			block,
			secondaryVersions[ block.clientId ],
			primaryVersions[ block.clientId ],
			hasInnerBlockChanges,
			innerBlocks
		);

		hasChanges = hasChanges || newBlock !== mapA[ block.clientId ].block;
		blocks.push( newBlock );
		newVersions[ newBlock.clientId ] = newVersion;

		return blocks;
	}, [] );

	secondaryBlocks.forEach( ( block ) => {
		if (
			! alreadyAddedBlocks[ block.clientId ] &&
			! deletedBlocks[ block.clientId ] &&
			! primaryMap.hasOwnProperty( block.clientId )
		) {
			const { index } = secondaryMap[ block.clientId ];
			newBlocks = [
				...newBlocks.slice( 0, index ),
				block,
				...newBlocks.slice( index ),
			];
			newVersions[ block.clientId ] = secondaryVersions[ block.clientId ];
		}
	} );

	return { blocks: newBlocks, hasChanges, versions: newVersions };
};

export function mergeBlocks(
	localBlocks,
	remoteBlocks,
	localBlocksVersions,
	remoteBlocksVersions,
	localPositionsVersions,
	remotePositionsVersions,
	deletedBlocks = {}
) {
	// Prepare local blocks map
	const localBlocksMap = getBlocksMap( localBlocks );
	const remoteBlocksMap = getBlocksMap( remoteBlocks );

	const { hasChanges, blocks, versions } = reconcileBlocks(
		localBlocks,
		remoteBlocks,
		localBlocksMap,
		remoteBlocksMap,
		localBlocksVersions,
		remoteBlocksVersions,
		localPositionsVersions,
		remotePositionsVersions,
		deletedBlocks
	);

	if ( ! hasChanges ) {
		return { blocks: localBlocks, versions: localBlocksVersions };
	}
	return { blocks, versions };
}

function getPostData( current, post ) {
	return {
		post,
		positionVersions: getPositionVersions(
			current.positionVersions,
			current.post?.blocks || [],
			post.blocks || []
		),
		blockVersions: getBlockVersions(
			current.blockVersions,
			current.post?.blocks || [],
			post.blocks || []
		),
		deletedBlocks: {
			...current.deletedBlocks,
			...getDeletedBlocks(
				current.post?.blocks || [],
				post.blocks || []
			),
		},
	};
}

const shouldSync = ( doc1, doc2 ) => {
	if ( ! doc1.post._id ) {
		return false;
	}

	return ! (
		isShallowEqualObjects( doc1.blockVersions, doc2.blockVersions ) &&
		isShallowEqualObjects( doc1.positionVersions, doc2.positionVersions ) &&
		isShallowEqualObjects( doc1.deletedBlocks, doc2.deletedBlocks ) &&
		doc1.post.title === doc2.post.title
	);
};

export function useSyncEdits( initialPost, encryptionKey, ownerKey ) {
	const [ editedPost, setEditedPost ] = useState( initialPost );
	const syncDoc = useRef( getPostData( {}, initialPost ) );
	const identity = useRef( uuidv4() );
	const isInitialized = useRef( false );
	const socket = useRef();

	const { peers, ...selection } = useSelect( ( select ) => {
		return {
			peers: select( 'asblocks' ).getPeers(),
			start: select( 'core/block-editor' ).getSelectionStart(),
			end: select( 'core/block-editor' ).getSelectionEnd(),
		};
	}, [] );
	const { setPeers, setPeerSelection, setAvailablePeers } = useDispatch(
		'asblocks'
	);

	// Local change handler
	async function onChangePost( newPost ) {
		if ( newPost === syncDoc.current.post ) {
			return;
		}

		const newDocData = getPostData( syncDoc.current, newPost );
		const shouldSyncData = shouldSync( syncDoc.current, newDocData );
		syncDoc.current = newDocData;

		// This needs to be called synchronously
		// otherwise we might have selection jumps in the editor
		setEditedPost( newDocData.post );

		if ( shouldSyncData ) {
			socket.current.emit(
				'server-volatile-broadcast',
				syncDoc.current.post._id,
				{
					action: await encrypt(
						{
							type: 'update',
							...syncDoc.current,
							identity: identity.current,
							selection,
						},
						encryptionKey
					),
					ownerKey,
				}
			);
		}
	}

	useEffect( () => {
		if ( ! editedPost._id ) {
			return;
		}

		socket.current = io( config.collabServer );

		// Join the room on init
		socket.current.on( 'init-room', () => {
			socket.current.emit( 'join-room', editedPost._id );
		} );

		// Mark the scene as ready
		socket.current.on( 'first-in-room', () => {
			isInitialized.current = true;
			socket.current.off( 'first-in-room' );
		} );

		// When a new user connects to the room, send the current post.
		socket.current.on( 'new-user', async () => {
			socket.current.emit( 'server-broadcast', editedPost._id, {
				action: await encrypt(
					{
						type: 'init',
						...syncDoc.current,
						identity: identity.current,
						peers: {
							...peers,
							[ socket.current.id ]: selection,
						},
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
					const shouldSyncData = shouldSync(
						syncDoc.current,
						action
					);

					setPeerSelection( socketId, action.selection );

					if ( ! shouldSyncData ) {
						return;
					}

					const mergedDeletedBlocks = {
						...syncDoc.current.deletedBlocks,
						...action.deletedBlocks,
					};

					const merged = mergeBlocks(
						syncDoc.current.post.blocks,
						action.post.blocks,
						syncDoc.current.blockVersions,
						action.blockVersions,
						syncDoc.current.positionVersions,
						action.positionVersions,
						mergedDeletedBlocks
					);

					syncDoc.current = {
						post: {
							...action.post,
							blocks: merged.blocks,
						},
						blockVersions: merged.versions,
						positionVersions: getPositionVersions(
							syncDoc.current.positionVersions,
							syncDoc.current.post.blocks,
							merged.blocks
						),
						deletedBlocks: mergedDeletedBlocks,
					};

					setEditedPost( syncDoc.current.post );
					break;
				}

				case 'init': {
					if ( isInitialized.current ) {
						return;
					}
					isInitialized.current = true;
					syncDoc.current = {
						deletedBlocks: action.deletedBlocks,
						blockVersions: action.blockVersions,
						positionVersions: action.positionVersions,
						post: action.post,
					};
					setPeers( action.peers );
					setEditedPost( syncDoc.current.post );
				}
			}
		} );

		socket.current.on( 'room-user-change', ( newPeers ) => {
			setAvailablePeers( newPeers );
		} );

		return () => {
			socket.current.close();
			socket.current = null;
			setAvailablePeers( [] );
		};
	}, [ editedPost._id ] );

	return [ editedPost, onChangePost ];
}
