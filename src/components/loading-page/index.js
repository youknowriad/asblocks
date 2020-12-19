import { Logo } from '../logo';
import { LoadingCanvas } from '../loading-canvas';
import './style.css';

export function LoadingPage() {
	return (
		<div className="loading-page">
			<div className="loading-page__header">
				<Logo />
			</div>

			<LoadingCanvas />
		</div>
	);
}
