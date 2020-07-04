import { Spinner } from '../spinner';
import './style.css';

export function LoadingCanvas() {
	return (
		<div className="loading-canvas">
			<Spinner />
		</div>
	);
}
