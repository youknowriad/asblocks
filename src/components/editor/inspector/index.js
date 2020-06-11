import { Button } from '@wordpress/components';
import { BlockInspector } from '@wordpress/block-editor';
import { close } from '@wordpress/icons';
import './style.css';

export function Inspector( { onClose } ) {
	return (
		<div>
			<div className="editor__inspector-header">
				<Button
					icon={ close }
					onClick={ onClose }
					label="Close Inspector"
				/>
			</div>

			<BlockInspector />
		</div>
	);
}
