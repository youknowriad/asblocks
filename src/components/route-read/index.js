import { useEffect } from '@wordpress/element';
import usePromise from 'react-promise-suspense';
import { useParams } from 'react-router-dom';
import { PostRender } from '../post-render';
import { fetchPost } from '../../api/posts';
import { useSuspendedApi } from '../../lib/data';
import { stringToKey } from '../../lib/crypto';
import { useLocalPostSave } from '../../local-storage';

export function RouteRead() {
	const { id } = useParams();
	const stringKey = window.location.href.substring(
		window.location.href.indexOf( '#key=' ) + 5
	);
	const encryptionKey = usePromise( stringToKey, [ stringKey ] );
	const post = useSuspendedApi( fetchPost, [ id, encryptionKey ] );
	const setLocalPost = useLocalPostSave();
	useEffect( () => {
		setLocalPost( {
			_id: id,
			title: post.title,
			key: stringKey,
		} );
	}, [ id, post, stringKey ] );

	return <PostRender post={ post } />;
}
