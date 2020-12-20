import { useState, useMemo } from '@wordpress/element';
import { useLocalPostList } from '../../local-storage';
import { SearchControl } from '../search-control';
import { Pill } from '../pill';
import { ButtonLink } from '../button-link';
import { ModalToggle } from '../modal-toggle';
import { Button } from '@wordpress/components';
import { DocumentOpen } from '../document-open';
import './style.css';
import isElectron from 'is-electron';

export function Documents() {
	const [ postList ] = useLocalPostList();
	const [ filterValue, setFilterValue ] = useState( '' );
	const filteredPosts = useMemo(
		() =>
			postList.filter(
				( post ) =>
					post.title &&
					post.title
						.toLowerCase()
						.includes( filterValue.toLowerCase() )
			),
		[ filterValue, postList ]
	);

	return (
		<div>
			<div className="documents__header">
				<div>
					<h3>Documents</h3>
					{ postList?.length && <Pill>{ postList.length }</Pill> }
				</div>
				<ButtonLink isPrimary to="/">
					New
				</ButtonLink>
				{ isElectron() && (
					<ModalToggle
						title="Open a shared document"
						renderToggle={ ( { onToggle, isOpen } ) => (
							<Button
								onClick={ onToggle }
								aria-haspopup="true"
								aria-expanded={ isOpen }
								isPrimary
							>
								Open
							</Button>
						) }
						renderContent={ ( { onClose } ) => (
							<DocumentOpen onOpen={ onClose } />
						) }
					/>
				) }
			</div>

			<div className="documents__search">
				<SearchControl
					label="Search Documents"
					value={ filterValue }
					onChange={ setFilterValue }
				/>
			</div>

			<ul className="documents__menu">
				{ filteredPosts.map( ( post ) => {
					const url = post.ownerKey
						? `/write/${ post._id }/${ post.ownerKey }#key=${ post.key }`
						: `/read/${ post._id }#key=${ post.key }`;
					return (
						<li key={ post._id }>
							<ButtonLink
								to={ url }
								isPressed={ window.location.href.includes(
									url
								) }
							>
								{ post.title || '(No Title)' }
							</ButtonLink>
						</li>
					);
				} ) }

				{ ! filteredPosts.length && <p>No results found.</p> }
			</ul>
		</div>
	);
}
