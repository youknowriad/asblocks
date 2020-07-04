import { useState, useMemo } from '@wordpress/element';
import { Button } from '@wordpress/components';
import { close } from '@wordpress/icons';
import { DarkModeToggle } from '../dark-mode-toggle';
import { useLocalPostList, useIsSidebarOpened } from '../../local-storage';
import { SearchControl } from '../search-control';
import { Pill } from '../pill';
import './style.css';

export function Sidebar() {
	const [ postList ] = useLocalPostList();
	const [ , setIsSidebarOpened ] = useIsSidebarOpened();
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
		<>
			<div className="sidebar__close">
				<Button
					icon={ close }
					onClick={ () => setIsSidebarOpened( false ) }
					label="Close Inspector"
				/>
			</div>
			<div className="sidebar__section is-about">
				<strong>AsBlocks</strong> is an{ ' ' }
				<a href="https://en.wikipedia.org/wiki/End-to-end_encryption">
					end-to-end encrypted
				</a>{ ' ' }
				(private) collaborative writing environment powered by{ ' ' }
				<a href="https://github.com/WordPress/gutenberg">Gutenberg</a>{ ' ' }
				and{ ' ' }
				<a href="https://github.com/youknowriad/asblocks">
					you can contribute
				</a>
				.
			</div>

			{ !! postList?.length && (
				<div className="sidebar__section">
					<div className="sidebar__main-menu-header">
						<div>
							<h3>Document List</h3>
							<Pill>{ postList.length }</Pill>
						</div>
						<Button isPrimary href="/">
							New
						</Button>
					</div>

					<div className="sidebar__search">
						<SearchControl
							label="Search Documents"
							value={ filterValue }
							onChange={ setFilterValue }
						/>
					</div>

					<ul className="sidebar__main-menu">
						{ filteredPosts.map( ( post ) => {
							const url = post.ownerKey
								? `${ window.location.origin }/write/${ post._id }/${ post.ownerKey }#key=${ post.key }`
								: `${ window.location.origin }/read/${ post._id }#key=${ post.key }`;
							return (
								<li key={ post._id }>
									<Button href={ url }>
										{ post.title || '(No Title)' }
									</Button>
								</li>
							);
						} ) }

						{ ! filteredPosts.length && <p>No results found.</p> }
					</ul>
				</div>
			) }

			<div className="sidebar__section">
				<h3>Options</h3>
				<DarkModeToggle />
			</div>
		</>
	);
}
