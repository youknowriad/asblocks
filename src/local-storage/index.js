import { v4 as uuidv4 } from 'uuid';
import { createLocalStorageStateHook } from 'use-local-storage-state';

export const useDarkMode = createLocalStorageStateHook( 'dark-mode', false );
export const useAuthorId = createLocalStorageStateHook( 'author-id', uuidv4() );
export const useAuthorName = createLocalStorageStateHook(
	'author-name',
	'Anonymous'
);
