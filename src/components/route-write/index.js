import { useDispatch } from '@wordpress/data';
import { useEffect } from '@wordpress/element';
import usePromise from 'react-promise-suspense';
import { useParams } from 'react-router-dom';
import { Editor } from '../editor';
import { fetchPost } from '../../api/posts';
import { useSuspendedApi } from '../../lib/data';
import { stringToKey } from '../../lib/crypto';
import { useLocalPostSave } from '../../local-storage';

export function RouteWrite() {
	const { id, ownerKey } = useParams();
	const stringKey = window.location.hash.slice( '#key='.length );
	const encryptionKey = usePromise( stringToKey, [ stringKey ] );
	const post = useSuspendedApi( fetchPost, [ id, encryptionKey ] );
	const { persist } = useDispatch( 'asblocks' );
	const setLocalPost = useLocalPostSave();
	useEffect( () => {
		persist( post );
	}, [ post ] );
	useEffect( () => {
		setLocalPost( {
			_id: id,
			title: post.title,
			key: stringKey,
			ownerKey,
		} );
	}, [ id, post, stringKey ] );
	return <Editor encryptionKey={ encryptionKey } ownerKey={ ownerKey } />;
}
