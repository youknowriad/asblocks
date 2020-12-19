import classnames from 'classnames';
import { Button } from '@wordpress/components';
import { Icon, people } from '@wordpress/icons';
import { useDispatch } from '@wordpress/data';
import { ENTER, SPACE } from '@wordpress/keycodes';
import { __experimentalUseFocusOutside } from '@wordpress/compose';
import { useAuthorId } from '../../../local-storage';
import { CommentForm } from '../comment-form';
import { CommentReplies } from '../comment-replies';

export function Comment( { comment, position, isSelected } ) {
	const [ authorId ] = useAuthorId();
	const { updateComment, removeComment, selectComment } = useDispatch(
		'asblocks'
	);
	const { clearSelectedBlock } = useDispatch( 'core/block-editor' );
	const focusOutsideProps = __experimentalUseFocusOutside( () =>
		selectComment( null )
	);
	const isBeingEdited =
		comment.status === 'draft' && authorId === comment.authorId;
	const update = ( content ) => {
		updateComment( comment._id, {
			...comment,
			content,
			status: undefined,
		} );
	};
	const cancel = () => {
		removeComment( comment._id );
	};
	const resolve = () => {
		updateComment( comment._id, {
			...comment,
			status: 'resolved',
		} );
	};
	const onReply = ( reply ) => {
		updateComment( comment._id, {
			...comment,
			replies: [ ...( comment.replies ?? [] ), reply ],
		} );
	};
	const select = () => {
		clearSelectedBlock();
		selectComment( comment._id );
	};

	const extraProps = isSelected
		? {}
		: {
				role: 'button',
				tabIndex: 0,
				onClick: select,
				onKeyDown: ( event ) => {
					if ( ENTER === event.keyCode || SPACE === event.keyCode ) {
						select();
					}
				},
		  };

	return (
		<div
			className={ classnames( 'editor-comments__item', {
				'is-selected': isSelected,
				'is-editing': isBeingEdited,
			} ) }
			style={ { top: position } }
			{ ...extraProps }
			{ ...focusOutsideProps }
		>
			{ ! isBeingEdited && comment.authorName && (
				<div className="editor-comments__item-author">
					<Icon icon={ people } />
					<span className="editor-comments__item-author-name">
						{ comment.authorName }
					</span>
					<Button isSecondary isSmall onClick={ resolve }>
						Resolve
					</Button>
				</div>
			) }
			{ isBeingEdited && (
				<CommentForm
					focusOnMount
					initialValue={ comment.content }
					onCancel={ cancel }
					onSubmit={ update }
				/>
			) }
			{ ! isBeingEdited && (
				<>
					<div className="editor-comments__item-content">
						{ comment.content }
					</div>
					{ isSelected && (
						<CommentReplies
							replies={ comment.replies }
							onReply={ onReply }
						/>
					) }
				</>
			) }
		</div>
	);
}
