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
			working live with collaborators, it is recommended to refresh the
			page.
		</Snackbar>
	);
}
