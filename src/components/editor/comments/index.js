import { useSelect } from '@wordpress/data';
import { useMemo } from '@wordpress/element';
import { Dropdown, Button } from '@wordpress/components';
import { getPositions } from './positions';
import { SelectedComment, UnselectedComment } from './comment';
import './style.css';

export function Comments() {
	const { comments, selectedComment, unattachedComments } = useSelect(
		( select ) => {
			return {
				comments: select( 'asblocks' ).getSortedComments(),
				unattachedComments: select(
					'asblocks'
				).getUnattachedComments(),
				selectedComment: select( 'asblocks' ).getSelectedComment(),
			};
		},
		[]
	);
	const { height, positions } = useMemo( () => getPositions( comments ), [
		comments,
	] );
	return (
		<>
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
			{ !! unattachedComments.length && (
				<Dropdown
					className="editor-comments__unattached"
					contentClassName="editor-comments__unattached-content"
					renderToggle={ ( { onToggle, isOpen } ) => (
						<Button
							onClick={ onToggle }
							aria-haspopup="true"
							aria-expanded={ isOpen }
						>
							Unattached Comments
						</Button>
					) }
					renderContent={ () => (
						<div>
							<p className="editor-comments__unattached-content-info">
								These are unresolved comments that lost their
								connection to the edited post while editing
							</p>
							{ unattachedComments.map( ( comment ) => {
								const CommentComponent =
									selectedComment === comment._id
										? SelectedComment
										: UnselectedComment;
								return (
									<CommentComponent
										key={ comment._id }
										comment={ comment }
									/>
								);
							} ) }
						</div>
					) }
				/>
			) }
		</>
	);
}
