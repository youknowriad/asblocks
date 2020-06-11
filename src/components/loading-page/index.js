import { Logo } from '../logo';
import { Spinner } from '../spinner';
import './style.css';

export function LoadingPage() {
	return (
		<div className="loading-page">
			<div className="loading-page__header">
				<Logo />
			</div>

			<div className="loading-page__indicator">
				<Spinner />
			</div>
		</div>
	);
}
