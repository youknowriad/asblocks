import { PlainText } from '@wordpress/block-editor';
import './style.css';

export function PostTitleEditor( { value, onChange } ) {
	return (
		<PlainText
			className="wp-block editor__post-title-editor"
			__experimentalVersion={ 2 }
			placeholder="Add Title"
			value={ value }
			onChange={ onChange }
		/>
	);
}
