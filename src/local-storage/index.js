import { v4 as uuidv4 } from 'uuid';
import { createLocalStorageStateHook } from 'use-local-storage-state';
import { useCallback } from '@wordpress/element';

export const useIsSidebarOpened = createLocalStorageStateHook(
	'sidebar-opened',
	false
);
export const useTheme = createLocalStorageStateHook( 'theme', 'modern' );
export const useDarkMode = createLocalStorageStateHook( 'dark-mode', false );
export const useAuthorId = createLocalStorageStateHook( 'author-id', uuidv4() );
export const useAuthorName = createLocalStorageStateHook(
	'author-name',
	'Anonymous'
);
export const useLocalPostList = createLocalStorageStateHook( 'post-list', [] );
export const useLocalPostSave = () => {
	const [ postList, setPostList ] = useLocalPostList();

	const setPost = useCallback(
		( newPost ) => {
			const id = newPost._id;
			const index = postList.findIndex( ( p ) => p._id === id );
			if ( index !== -1 ) {
				setPostList( [
					...postList.slice( 0, index ),
					{
						...postList[ index ],
						...newPost,
					},
					...postList.slice( index + 1 ),
				] );
			} else {
				setPostList( [ ...postList, newPost ] );
			}
		},
		[ postList ]
	);

	return setPost;
};
