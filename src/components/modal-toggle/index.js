import { Modal } from '@wordpress/components';
import { useState } from '@wordpress/element';

export function ModalToggle( { title, renderToggle, renderContent } ) {
	const [ isOpen, setIsOpen ] = useState();
	const onClose = () => {
		setIsOpen( false );
	};
	return (
		<>
			{ renderToggle( {
				isOpen,
				onToggle: () => setIsOpen( ! isOpen ),
			} ) }
			{ isOpen && (
				<Modal title={ title } onRequestClose={ onClose }>
					{ renderContent( { onClose } ) }
				</Modal>
			) }
		</>
	);
}
