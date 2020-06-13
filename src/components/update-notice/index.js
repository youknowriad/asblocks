import { Snackbar } from '@wordpress/components';
import { useUpdateCheck } from 'react-update-notification';

export function UpdateNotice() {
	const { status } = useUpdateCheck( {
		type: 'interval',
		interval: 10000,
	} );

	if ( status === 'checking' || status === 'current' ) {
		return null;
	}

	return (
		<Snackbar>
			A new version of the application is available. To avoid issues when
			working live with collaborators, it is recommended to save your post
			locally or to the cloud using the { '"Save"' } button and refresh
			the page.
		</Snackbar>
	);
}
