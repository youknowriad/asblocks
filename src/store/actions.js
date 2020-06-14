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
