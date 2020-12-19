import { useState, useMemo } from '@wordpress/element';
import { Button } from '@wordpress/components';
import { useLocalPostList } from '../../local-storage';
import { SearchControl } from '../search-control';
import { Pill } from '../pill';
import './style.css';

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

	if ( ! postList?.length ) {
		return null;
	}

	return (
		<div>
			<div className="documents__header">
				<div>
					<h3>Documents</h3>
					<Pill>{ postList.length }</Pill>
				</div>
				<Button isPrimary href="/">
					New
				</Button>
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
						? `${ window.location.origin }/write/${ post._id }/${ post.ownerKey }#key=${ post.key }`
						: `${ window.location.origin }/read/${ post._id }#key=${ post.key }`;
					return (
						<li key={ post._id }>
							<Button
								href={ url }
								isPressed={ window.location.href === url }
							>
								{ post.title || '(No Title)' }
							</Button>
						</li>
					);
				} ) }

				{ ! filteredPosts.length && <p>No results found.</p> }
			</ul>
		</div>
	);
}
