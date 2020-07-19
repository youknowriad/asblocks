import { v4 as uuidv4 } from 'uuid';
import { Icon, people } from '@wordpress/icons';
import { CommentForm } from '../comment-form';
import { useAuthorId, useAuthorName } from '../../../local-storage';
import './style.css';

export function CommentReplies( { replies = [], onReply } ) {
	const [ authorId ] = useAuthorId();
	const [ authorName ] = useAuthorName();
	function onAddReply( content ) {
		onReply( {
			_id: uuidv4(),
			content,
			authorId,
			authorName,
			createdAt: Date.now(),
		} );
	}

	return (
		<>
			{ replies.map( ( reply ) => (
				<div className="comment-replies__item" key={ reply._id }>
					{ reply.authorName && (
						<div className="comment-replies__item-author">
							<Icon icon={ people } />
							{ reply.authorName }
						</div>
					) }
					<div className="comment-replies__item-content">
						{ reply.content }
					</div>
				</div>
			) ) }
			<div className="comment-replies__form">
				<CommentForm
					key={ replies.length } // remount on reply
					focusOnMount={ false }
					initialValue=""
					onSubmit={ onAddReply }
					placeholder="Reply"
				/>
			</div>
		</>
	);
}
