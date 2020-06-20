import { v4 as uuidv4 } from 'uuid';
import { addFilter } from '@wordpress/hooks';
import { createHigherOrderComponent } from '@wordpress/compose';
import { BlockControls } from '@wordpress/block-editor';
import { ToolbarButton, Toolbar } from '@wordpress/components';
import { comment } from '@wordpress/icons';
import { useDispatch, useSelect } from '@wordpress/data';
import { useEffect } from '@wordpress/element';
import { useAuthorId, useAuthorName } from '../../../local-storage';

function BlockCommentsControls( { clientId } ) {
	const {
		getEditedProperty,
		getSelectedComment,
		selectionStart,
		selectionEnd,
	} = useSelect(
		( select ) => ( {
			getEditedProperty: select( 'asblocks' ).getEditedProperty,
			getSelectedComment: select( 'asblocks' ).getSelectedComment,
			selectionEnd: select( 'core/block-editor' ).getSelectionEnd(),
			selectionStart: select( 'core/block-editor' ).getSelectionStart(),
		} ),
		[]
	);

	const { addComment, selectComment } = useDispatch( 'asblocks' );
	const [ authorId ] = useAuthorId();
	const [ authorName ] = useAuthorName();
	function onClick() {
		addComment( {
			start: selectionStart,
			end: selectionEnd,
			type: 'block',
			_id: uuidv4(),
			content: '',
			status: 'draft',
			authorId,
			authorName,
		} );
	}

	// Select block comment when the block gets selected.
	// Mounting this component means the block just got selected.
	useEffect( () => {
		if (
			selectionStart.clientId !== selectionEnd.clientId ||
			selectionStart.richTextIdentifier !==
				selectionEnd.richTextIdentifier ||
			selectionStart.offset !== selectionEnd.offset
		) {
			return;
		}

		const comments = getEditedProperty( 'comments' );
		const selectedComment = getSelectedComment();
		const hasExistingComment =
			selectedComment &&
			comments?.some( ( c ) => {
				return (
					c._id === selectedComment &&
					c.start?.clientId === c.end?.clientId &&
					// Some comments don't have selections
					c.start?.richTextIdentifier ===
						selectionStart?.richTextIdentifier &&
					c.end?.richTextIdentifier ===
						selectionEnd?.richTextIdentifier &&
					c.start?.offset <= selectionStart.offset &&
					c.end?.offset >= selectionStart.offset
				);
			} );

		if ( hasExistingComment ) {
			return;
		}

		const commentToSelect =
			// Find Format Level Comment
			comments?.find( ( c ) => {
				return (
					c.start?.clientId === c.end?.clientId &&
					c.start?.clientId === clientId &&
					c.start?.richTextIdentifier ===
						selectionStart?.richTextIdentifier &&
					c.end?.richTextIdentifier ===
						selectionEnd?.richTextIdentifier &&
					c.start?.offset <= selectionStart.offset &&
					c.end?.offset >= selectionStart.offset
				);
			} ) ||
			// Otherwise Find Block Level Comment
			comments?.find( ( c ) => {
				return (
					c.start?.clientId === c.end?.clientId &&
					c.start?.clientId === clientId
				);
			} );
		if ( commentToSelect ) {
			selectComment( commentToSelect._id );
		}
	}, [ selectionStart, selectionEnd ] );

	return (
		<BlockControls>
			<Toolbar>
				<ToolbarButton
					name="bold"
					icon={ comment }
					title="Add a comment"
					onClick={ onClick }
				/>
			</Toolbar>
		</BlockControls>
	);
}

/**
 * Adds the Block Comment button to the block toolbar
 *
 * @param  {Function} BlockEdit Original component
 * @return {Function}           Wrapped component
 */
export const withBlockComments = createHigherOrderComponent(
	( BlockEdit ) => ( props ) => {
		return [
			props.isSelected && (
				<BlockCommentsControls
					key="block-comments"
					clientId={ props.clientId }
				/>
			),
			<BlockEdit key="edit" { ...props } />,
		];
	},
	'withBlockComments'
);

addFilter(
	'editor.BlockEdit',
	'asblocks/with-block-comment',
	withBlockComments
);
