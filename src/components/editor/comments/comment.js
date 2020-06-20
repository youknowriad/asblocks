import classnames from 'classnames';
import { PlainText } from '@wordpress/block-editor';
import { Button, withFocusOutside } from '@wordpress/components';
import { Icon, people } from '@wordpress/icons';
import { useDispatch } from '@wordpress/data';
import {
	useState,
	forwardRef,
	useImperativeHandle,
	useRef,
	useEffect,
} from '@wordpress/element';
import { ENTER, SPACE } from '@wordpress/keycodes';
import { useAuthorId } from '../../../local-storage';

export const UnselectedComment = withFocusOutside(
	forwardRef( ( { comment, position }, ref ) => {
		useImperativeHandle( ref, () => ( {
			handleFocusOutside: () => {
				selectComment( null );
			},
		} ) );
		const { selectComment } = useDispatch( 'asblocks' );
		const { clearSelectedBlock } = useDispatch( 'core/block-editor' );
		const select = () => {
			clearSelectedBlock();
			selectComment( comment._id );
		};

		return (
			<div
				style={ { top: position } }
				className="editor-comments__item"
				tabIndex="0"
				role="button"
				onClick={ select }
				onKeyDown={ ( event ) => {
					if ( ENTER === event.keyCode || SPACE === event.keyCode ) {
						select();
					}
				} }
			>
				{ comment.authorName && (
					<div className="editor-comments__item-author">
						<Icon icon={ people } />
						{ comment.authorName }
					</div>
				) }
				<div className="editor-comments__item-content">
					{ comment.content }
				</div>
			</div>
		);
	} )
);

export function SelectedComment( { comment, position } ) {
	const [ authorId ] = useAuthorId();
	const { updateComment, removeComment } = useDispatch( 'asblocks' );
	const [ editedContent, setContent ] = useState( comment.content );
	const textarea = useRef();
	const isBeingEdited =
		comment.status === 'draft' && authorId === comment.authorId;
	const update = ( event ) => {
		event.preventDefault();
		updateComment( comment._id, {
			...comment,
			content: editedContent,
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
	useEffect( () => {
		if ( isBeingEdited ) {
			textarea.current.focus();
		}
	}, [ isBeingEdited ] );

	return (
		<div
			className={ classnames( 'editor-comments__item is-selected', {
				'is-editing': isBeingEdited,
			} ) }
			style={ { top: position } }
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
				<form onSubmit={ update }>
					<PlainText
						ref={ textarea }
						__experimentalVersion={ 2 }
						placeholder="Add Title"
						value={ editedContent }
						onChange={ setContent }
					/>
					<Button isPrimary type="submit">
						Post
					</Button>
					<Button isTertiary onClick={ cancel }>
						Cancel
					</Button>
				</form>
			) }
			{ ! isBeingEdited && (
				<div className="editor-comments__item-content">
					{ comment.content }
				</div>
			) }
		</div>
	);
}
