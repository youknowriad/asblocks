import * as yjs from 'yjs';
import { useEffect, useState } from '@wordpress/element';
import { WebrtcProvider } from 'y-webrtc';
import setYDocBlocks from './set-y-doc-blocks';
import yDocBlocksToArray from './y-doc-blocks-to-array';

const instances = {};
export function useSyncEdits( ownerKey, encriptionKeyString ) {
	const [ peers, setPeers ] = useState( [] );
	const [ blocks, _setBlocks ] = useState( [] );
	const [ setBlocks, setSetBlocks ] = useState( () => ( newBlocks ) =>
		_setBlocks( newBlocks )
	);

	useEffect( () => {
		// We share instances between hook instances for the same document,
		// because we need to reuse the same `yDoc` and provider.
		// Note that the `localYjsChangeSymbol` does differ per hook instance,
		// so that edits made through one sync to the others.
		const instanceKey = `${ ownerKey }|${ encriptionKeyString }`;
		if ( ! instances[ instanceKey ] ) {
			const yDoc = new yjs.Doc();
			const yDocBlocks = yDoc.getMap( 'blocks' );
			yDocBlocks.set( 'order', new yjs.Map() );
			yDocBlocks.set( 'byClientId', new yjs.Map() );

			instances[ instanceKey ] = {
				yDoc,
				blocks: yDocBlocks,
				provider: new WebrtcProvider( ownerKey, yDoc, {
					password: encriptionKeyString,
				} ),
			};
		}

		// Keep peer list in sync.
		instances[ instanceKey ].provider.on( 'peers', ( { webrtcPeers } ) =>
			setPeers( webrtcPeers )
		);

		// Create setter that broadcasts changes to peers.
		const localYjsChangeSymbol = Symbol( 'localYjsChangeSymbol' );
		setSetBlocks( () => ( newBlocks ) => {
			_setBlocks( newBlocks );

			instances[ instanceKey ].yDoc.transact( () => {
				setYDocBlocks( instances[ instanceKey ].blocks, newBlocks );
			}, localYjsChangeSymbol );
		} );

		// Set changes from peers.
		const maybeSetBlocks = ( event, transaction ) => {
			if ( transaction.origin !== localYjsChangeSymbol )
				_setBlocks(
					yDocBlocksToArray( instances[ instanceKey ].blocks )
				);
		};
		instances[ instanceKey ].blocks.observeDeep( maybeSetBlocks );
		return () =>
			instances[ instanceKey ].blocks.unobserveDeep( maybeSetBlocks );
	}, [ ownerKey, encriptionKeyString ] );

	return {
		peers,
		blocks,
		setBlocks,
	};
}
