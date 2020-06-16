import { select } from '@wordpress/data-controls';
import { serialize } from '@wordpress/blocks';

export function setAvailablePeers( peers ) {
	return {
		type: 'SET_AVAILABLE_PEERS',
		peers,
	};
}

export function setPeerSelection( peer, selection ) {
	return {
		type: 'SET_PEER_SELECTION',
		peer,
		selection,
	};
}

export function* edit( changes, isRemote = false ) {
	yield {
		type: 'EDIT',
		changes,
	};

	if ( isRemote ) {
		return;
	}

	const doc = yield select( 'asblocks', 'getSharedDoc' );
	const edited = yield select( 'asblocks', 'getEdited' );
	if ( doc ) {
		doc.applyDataChanges( {
			...edited,
			...changes,
		} );
	}
}

export function selectComment( commentId ) {
	return {
		type: 'SELECT_COMMENT',
		commentId,
	};
}

export function* addComment( comment ) {
	const edited = yield select( 'asblocks', 'getEdited' );
	yield edit( { comments: [ ...( edited.comments || [] ), comment ] } );
	yield selectComment( comment._id );
}

export function* updateComment( id, comment ) {
	const edited = yield select( 'asblocks', 'getEdited' );
	const commentIndex = edited.comments
		? edited.comments.findIndex( ( c ) => c._id === id )
		: -1;
	if ( commentIndex === -1 ) {
		return;
	}
	const newComments = [ ...edited.comments ];
	newComments[ commentIndex ] = comment;

	yield edit( { comments: newComments } );
}

export function* removeComment( id ) {
	const edited = yield select( 'asblocks', 'getEdited' );
	const commentIndex = edited.comments
		? edited.comments.findIndex( ( c ) => c._id === id )
		: -1;
	if ( commentIndex === -1 ) {
		return;
	}
	const newComments = [ ...edited.comments ];
	newComments.splice( commentIndex, 1 );

	yield edit( { comments: newComments } );
}

export function persist( post, edits = {} ) {
	return {
		type: 'PERSIST',
		post,
		edits,
	};
}

export function setSharedDoc( doc ) {
	return {
		type: 'SET_SHARED_DOC',
		doc,
	};
}
