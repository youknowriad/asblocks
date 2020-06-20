/**
 * WordPress dependencies
 */
import classnames from 'classnames';
import { registerFormatType, applyFormat } from '@wordpress/rich-text';
import './style.css';

const FORMAT_NAME = 'asblocks/comment';

/**
 * Applies given comments to the given record.
 *
 * @param {Object} record The record to apply comments to.
 * @param {Array} comments The comments to apply.
 * @return {Object} A record with the comments applied.
 */
export function applyComments( record, comments = [] ) {
	comments.forEach( ( c ) => {
		const { start, end, isSelected } = c;
		record = applyFormat(
			record,
			{
				type: FORMAT_NAME,
				attributes: {
					class: classnames( {
						'is-selected': isSelected,
					} ),
				},
			},
			start,
			end
		);
	} );

	return record;
}

const settings = {
	title: 'Comment',
	tagName: 'mark',
	className: 'asblocks-comment',
	attributes: {
		className: 'class',
	},

	__experimentalGetPropsForEditableTreePreparation(
		select,
		{ richTextIdentifier, blockClientId }
	) {
		const selectedComment = select( 'asblocks' ).getSelectedComment();
		const comments = select( 'asblocks' )
			.getEditedProperty( 'comments' )
			?.filter( ( c ) => {
				return (
					c.status !== 'resolved' &&
					c.start?.clientId === blockClientId &&
					c.end?.clientId === blockClientId &&
					c.start.attributeKey === richTextIdentifier
				);
			} )
			?.map( ( c ) => ( {
				id: c._id,
				start: c.start.offset,
				end: c.end.offset,
				isSelected: c._id === selectedComment,
			} ) );
		return {
			comments,
		};
	},

	__experimentalCreatePrepareEditableTree( { comments } ) {
		return ( formats, text ) => {
			if ( ! comments?.length ) {
				return formats;
			}

			let record = { formats, text };
			record = applyComments( record, comments );
			return record.formats;
		};
	},
};

registerFormatType( FORMAT_NAME, settings );
