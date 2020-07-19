import isShallowEqual from '@wordpress/is-shallow-equal';
import { useSelect } from '@wordpress/data';
import { useState, useEffect, useRef } from '@wordpress/element';
import { Dropdown, Button } from '@wordpress/components';
import { getPositions } from './positions';
import { Comment } from './comment';
import './style.css';

export function Comments() {
	const [ { height, positions }, setPositions ] = useState( {
		height: 0,
		positions: {},
	} );
	const currentPositions = useRef( { height: 0, positions: {} } );
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
	useEffect( () => {
		const updatePositions = ( newPositions ) => {
			if (
				newPositions.height !== currentPositions.current.height ||
				! isShallowEqual(
					newPositions.positions,
					currentPositions.current.positions
				)
			) {
				setPositions( newPositions );
			}
			currentPositions.current = newPositions;
		};
		// Wait for the block rendering before recomputing the positions
		// comments object generates a new instance when the blocks change
		updatePositions( getPositions( comments ) );
		const interval = setInterval( () => {
			updatePositions( getPositions( comments ) );
		}, 500 );
		return () => {
			clearInterval( interval );
		};
	}, [ comments ] );

	return (
		<>
			<div className="editor-comments" style={ { minHeight: height } }>
				{ comments.map( ( comment ) => {
					return (
						<Comment
							key={ comment._id }
							comment={ comment }
							position={ positions[ comment._id ] }
							isSelected={ selectedComment === comment._id }
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
								return (
									<Comment
										key={ comment._id }
										comment={ comment }
										isSelected={
											selectedComment === comment._id
										}
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
