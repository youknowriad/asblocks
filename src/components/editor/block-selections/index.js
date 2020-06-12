import { addFilter } from '@wordpress/hooks';
import { useSelect } from '@wordpress/data';
import './style.css';

/**
 * Adds annotation className to the block-list-block component.
 *
 * @param {Object} OriginalComponent The original BlockListBlock component.
 * @return {Object} The enhanced component.
 */
const addSelectionBorders = ( OriginalComponent ) => {
	return ( props ) => {
		const isSelected = useSelect(
			( select ) => {
				const peers = select( 'asblocks' ).getPeers();
				return Object.values( peers ).some(
					( peer ) =>
						peer.start?.clientId === props.clientId &&
						peer.end?.clientId === props.clientId
				);
			},
			[ props.clientId ]
		);
		return (
			<OriginalComponent
				{ ...props }
				className={ isSelected ? 'is-peer-selected' : undefined }
			/>
		);
	};
};

addFilter( 'editor.BlockListBlock', 'asblocks', addSelectionBorders );
