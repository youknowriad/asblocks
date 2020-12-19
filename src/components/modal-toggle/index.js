import { Modal } from '@wordpress/components';
import { useState } from '@wordpress/element';

export function ModalToggle( { title, renderToggle, renderContent } ) {
	const [ isOpen, setIsOpen ] = useState();
	return (
		<>
			{ renderToggle( {
				isOpen,
				onToggle: () => setIsOpen( ! isOpen ),
			} ) }
			{ isOpen && (
				<Modal
					title={ title }
					onRequestClose={ () => {
						setIsOpen( false );
					} }
				>
					{ renderContent() }
				</Modal>
			) }
		</>
	);
}
