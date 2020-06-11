import React from 'react';
import { Button } from '@wordpress/components';
import { useHistory } from 'react-router-dom';

export function ButtonLink( { to, ...props } ) {
	const history = useHistory();
	const onClick = ( event ) => {
		event.preventDefault();
		history.push( to );
	};
	return <Button href={ to } onClick={ onClick } { ...props }></Button>;
}
