import { PlainText } from '@wordpress/block-editor';
import { Button } from '@wordpress/components';
import { useEffect, useRef, useState } from '@wordpress/element';
import './style.css';

export function CommentForm( {
	focusOnMount,
	initialValue,
	onCancel,
	onSubmit,
	placeholder,
} ) {
	const textarea = useRef();
	const [ editedContent, setContent ] = useState( initialValue );

	useEffect( () => {
		if ( focusOnMount ) {
			textarea.current.focus();
		}
	}, [] );

	const update = ( event ) => {
		event.preventDefault();
		onSubmit( editedContent );
	};

	return (
		<form className="comment-form" onSubmit={ update }>
			<PlainText
				ref={ textarea }
				__experimentalVersion={ 2 }
				placeholder={ placeholder ?? 'Write a comment' }
				value={ editedContent }
				onChange={ setContent }
				keepPlaceholderOnFocus
			/>
			{ !! editedContent && (
				<>
					<Button isPrimary type="submit">
						Post
					</Button>
					{ onCancel && (
						<Button isTertiary onClick={ onCancel }>
							Cancel
						</Button>
					) }
				</>
			) }
		</form>
	);
}
