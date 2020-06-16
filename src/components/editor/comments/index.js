import { useSelect } from '@wordpress/data';
import { useMemo } from '@wordpress/element';
import { getPositions } from './positions';
import { SelectedComment, UnselectedComment } from './comment';
import './style.css';

export function Comments() {
	const { comments, selectedComment } = useSelect( ( select ) => {
		return {
			comments: select( 'asblocks' ).getSortedComments(),
			selectedComment: select( 'asblocks' ).getSelectedComment(),
		};
	}, [] );
	const { height, positions } = useMemo( () => getPositions( comments ), [
		comments,
	] );
	return (
		<div className="editor-comments" style={ { minHeight: height } }>
			{ comments.map( ( comment ) => {
				const CommentComponent =
					selectedComment === comment._id
						? SelectedComment
						: UnselectedComment;
				return (
					<CommentComponent
						key={ comment._id }
						comment={ comment }
						position={ positions[ comment._id ] }
					/>
				);
			} ) }
		</div>
	);
}
