import { Logo } from '../logo';
import { LoadingCanvas } from '../loading-canvas';
import { Layout } from '../layout';
import './style.css';

export function LoadingPage() {
	return (
		<Layout>
			<div className="loading-page">
				<div className="loading-page__header">
					<Logo />
				</div>

				<LoadingCanvas />
			</div>
		</Layout>
	);
}
