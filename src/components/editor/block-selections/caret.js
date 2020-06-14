/**
 * WordPress dependencies
 */
import classnames from 'classnames';
import { applyFormat, registerFormatType } from '@wordpress/rich-text';

const FORMAT_NAME = 'asblocks/caret';

/**
 * Applies given carets to the given record.
 *
 * @param {Object} record The record to apply carets to.
 * @param {Array} carets The carets to apply.
 * @return {Object} A record with the carets applied.
 */
export function applyCarets( record, carets = [] ) {
	carets.forEach( ( caret ) => {
		let { start, end, id } = caret;
		const isCollapsed = start === end;
		const isShifted = isCollapsed && end >= record.text.length;

		if ( isShifted ) {
			start = record.text.length - 1;
		}

		if ( isCollapsed ) {
			end = start + 1;
		}

		record = applyFormat(
			record,
			{
				type: FORMAT_NAME,
				attributes: {
					id: 'asblocks-caret-' + id,
					class: classnames( {
						'is-collapsed': isCollapsed,
						'is-shifted': isShifted,
					} ),
				},
			},
			start,
			end
		);
	} );

	return record;
}

export const settings = {
	title: 'AsBlocks caret',
	tagName: 'mark',
	className: 'asblocks-caret',
	attributes: {
		id: 'id',
		className: 'class',
	},
	edit() {
		return null;
	},
	__experimentalGetPropsForEditableTreePreparation(
		select,
		{ richTextIdentifier, blockClientId }
	) {
		const peers = select( 'asblocks' ).getPeers();
		const carets = Object.entries( peers )
			.filter( ( [ , peer ] ) => {
				return (
					peer?.start?.clientId === blockClientId &&
					peer?.end?.clientId === blockClientId &&
					peer.start.attributeKey === richTextIdentifier
				);
			} )
			.map( ( [ id, peer ] ) => ( {
				id,
				start: peer.start.offset,
				end: peer.end.offset,
			} ) );
		return {
			carets,
		};
	},
	__experimentalCreatePrepareEditableTree( { carets } ) {
		return ( formats, text ) => {
			if ( carets.length === 0 ) {
				return formats;
			}

			let record = { formats, text };
			record = applyCarets( record, carets );
			return record.formats;
		};
	},
};

registerFormatType( FORMAT_NAME, settings );
