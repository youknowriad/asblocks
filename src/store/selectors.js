import createSelector from 'rememo';

export function getPeers( state ) {
	return state.peers;
}

export function getEditedProperty( state, property ) {
	return state.edits[ property ] ?? state.persisted[ property ];
}

export function getPersisted( state ) {
	return state.persisted;
}

export function getEdits( state ) {
	return state.edits;
}

export const getEdited = createSelector(
	( state ) => {
		return {
			...state.persisted,
			...state.edits,
		};
	},
	( state ) => [ state.persisted, state.edits ]
);

export function isShared( state ) {
	return state.persisted?.status === 'publish';
}

export function isDirty( state ) {
	return Object.keys( state.edits ).length > 0;
}

export function getSharedDoc( state ) {
	return state.sharedDoc;
}

export const getSortedComments = createSelector(
	( state ) => {
		const edited = getEdited( state );
		if ( ! edited.comments ) {
			return [];
		}
		const flattenBlocks = ( blocks = [], start = 0 ) => {
			let index = start;
			let orders = {};
			blocks.forEach( ( block ) => {
				orders[ block.clientId ] = index;
				index++;
				const { index: newIndex, orders: newOrders } = flattenBlocks(
					block.innerBlocks,
					index
				);
				index = newIndex;
				orders = {
					...orders,
					...newOrders,
				};
			} );

			return { index, orders };
		};
		const blockIndexes = flattenBlocks( edited.blocks ).orders;
		return edited.comments
			.filter(
				( c ) =>
					c.status !== 'resolved' &&
					blockIndexes[ c.start.clientId ] !== undefined
			)
			.sort( ( c1, c2 ) => {
				const diff =
					blockIndexes[ c1.start.clientId ] -
					blockIndexes[ c2.start.clientId ];

				if ( diff === 0 ) {
					return c1.start.offset - c2.start.clientId;
				}

				return diff;
			} );
	},
	( state ) => [ state.persisted, state.edits ]
);

export function getSelectedComment( state ) {
	return state.selectedComment;
}
