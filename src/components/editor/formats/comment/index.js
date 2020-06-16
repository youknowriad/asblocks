/**
 * WordPress dependencies
 */
import classnames from 'classnames';
import { v4 as uuidv4 } from 'uuid';
import { registerFormatType, applyFormat } from '@wordpress/rich-text';
import { RichTextToolbarButton } from '@wordpress/block-editor';
import { comment } from '@wordpress/icons';
import { useDispatch, useSelect } from '@wordpress/data';
import { useEffect } from '@wordpress/element';
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
	edit: function CommentEdit( { isActive } ) {
		const { addComment, selectComment } = useDispatch( 'asblocks' );
		const {
			selectionStart,
			selectionEnd,
			getEditedProperty,
			getSelectedComment,
		} = useSelect(
			( select ) => ( {
				selectionEnd: select( 'core/block-editor' ).getSelectionEnd(),
				selectionStart: select(
					'core/block-editor'
				).getSelectionStart(),
				getEditedProperty: select( 'asblocks' ).getEditedProperty,
				getSelectedComment: select( 'asblocks' ).getSelectedComment,
			} ),
			[]
		);
		function onClick() {
			addComment( {
				start: selectionStart,
				end: selectionEnd,
				type: 'format',
				_id: uuidv4(),
				content: '',
				status: 'draft',
			} );
		}
		useEffect( () => {
			if (
				selectionStart.blockClientId !== selectionEnd.blockClientId ||
				selectionStart.richTextIdentifier !==
					selectionEnd.richTextIdentifier ||
				selectionStart.offset !== selectionEnd.offset
			) {
				return;
			}
			const comments = getEditedProperty( 'comments' );
			const selectedComment = getSelectedComment();
			const newSelectedComment = comments?.find( ( c ) => {
				return (
					c.start?.clientId === selectionStart.clientId &&
					c.start.attributeKey === selectionStart.attributeKey &&
					c.start.offset <= selectionStart.offset &&
					c.end.offset >= selectionStart.offset
				);
			} );
			if (
				newSelectedComment &&
				newSelectedComment._id !== selectedComment
			) {
				selectComment( newSelectedComment._id );
			}
		}, [ selectionStart, selectionEnd ] );

		return (
			<>
				<RichTextToolbarButton
					name="bold"
					icon={ comment }
					title="Add a comment"
					onClick={ onClick }
					isActive={ isActive }
				/>
			</>
		);
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
