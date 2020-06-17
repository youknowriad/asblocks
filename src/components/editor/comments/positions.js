const COMMENT_HEIGHT = 70;

function getBlockDOMNode( clientId ) {
	return document.getElementById( 'block-' + clientId );
}

export function getPositions( comments ) {
	const parentRect = document
		.querySelector( '.editor__content' )
		?.getBoundingClientRect();
	let currentPosition = 0;
	if ( ! parentRect ) {
		return {
			height: currentPosition,
			positions: {},
		};
	}

	const positions = comments.reduce( ( acc, comment ) => {
		const domNode = getBlockDOMNode( comment.start.clientId );
		const currentRect = domNode?.getBoundingClientRect();
		const offset = currentRect?.top - parentRect.top;
		if ( ! domNode || offset < currentPosition ) {
			acc[ comment._id ] = currentPosition;
			currentPosition = currentPosition + COMMENT_HEIGHT;
			return acc;
		}
		acc[ comment._id ] = offset;
		currentPosition = offset + COMMENT_HEIGHT;
		return acc;
	}, {} );

	return {
		positions,
		height: currentPosition,
	};
}
