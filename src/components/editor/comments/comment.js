import { PlainText } from '@wordpress/block-editor';
import { Button, withFocusOutside } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import {
	useState,
	forwardRef,
	useImperativeHandle,
	useRef,
	useEffect,
} from '@wordpress/element';
import { ENTER, SPACE } from '@wordpress/keycodes';

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
				{ comment.content }
			</div>
		);
	} )
);

export function SelectedComment( { comment, position } ) {
	const { updateComment, removeComment } = useDispatch( 'asblocks' );
	const [ editedContent, setContent ] = useState( comment.content );
	const textarea = useRef();
	const isDraft = comment.status === 'draft';
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
	useEffect( () => {
		if ( isDraft ) {
			textarea.current.focus();
		}
	}, [] );

	return (
		<div
			className="editor-comments__item is-selected"
			style={ { top: position } }
		>
			{ isDraft && (
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
			{ ! isDraft && comment.content }
		</div>
	);
}
