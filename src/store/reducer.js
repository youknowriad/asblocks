import { combineReducers } from '@wordpress/data';

export function persisted( state = {}, action ) {
	switch ( action.type ) {
		case 'PERSIST':
			return action.post;
	}

	return state;
}

export function edits( state = {}, action ) {
	switch ( action.type ) {
		case 'EDIT':
			return {
				...state,
				...action.changes,
			};
		case 'PERSIST':
			return Object.entries( state ).reduce( ( acc, [ key, value ] ) => {
				if ( value !== action.edits[ key ] ) {
					acc[ key ] = value;
				}
				return acc;
			}, {} );
	}

	return state;
}

export function peers( state = {}, action ) {
	switch ( action.type ) {
		case 'SET_PEER_SELECTION':
			if ( ! state[ action.peer ] ) {
				return state;
			}
			return { ...state, [ action.peer ]: action.selection };
		case 'SET_AVAILABLE_PEERS':
			return action.peers.reduce( ( acc, peer ) => {
				acc[ peer ] = state[ peer ] || {};
				return acc;
			}, {} );
	}

	return state;
}

export function sharedDoc( state = null, action ) {
	switch ( action.type ) {
		case 'SET_SHARED_DOC':
			return action.doc;
	}

	return state;
}

export function selectedComment( state = null, action ) {
	switch ( action.type ) {
		case 'SELECT_COMMENT':
			return action.commentId;
	}

	return state;
}

export default combineReducers( {
	persisted,
	peers,
	edits,
	sharedDoc,
	selectedComment,
} );
