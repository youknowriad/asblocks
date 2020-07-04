import { Button } from '@wordpress/components';
import { useIsSidebarOpened } from '../../local-storage';
import './style.css';

export function Logo() {
	const [ isSidebarOpened, setIsSidebarOpened ] = useIsSidebarOpened();

	return (
		<Button
			className="logo"
			onClick={ () => setIsSidebarOpened( ! isSidebarOpened ) }
			aria-haspopup="true"
			aria-expanded={ isSidebarOpened }
			label="About AsBlocks"
			showTooltip
			icon={
				<svg
					width="18"
					height="18"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path d="M7 0h4v7h7v4h-4.1716l2.9498 2.9497-2.8285 2.8285L11 13.8284V18H7v-7H0V7h4.17155L1.2218 4.05025l2.82843-2.82843L7 4.17159V0z" />
				</svg>
			}
		/>
	);
}
