import { NavigationGeometry } from './NavigationGeometry';
import { ShipSchematic } from './ShipSchematic';

export function TerminalBackground() {
	return (
		<div className="terminal-bg-root pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
			<div className="terminal-bg-layer terminal-bg-layer--stars-far">
				<div className="terminal-starfield terminal-starfield-far absolute inset-0" />
			</div>
			<div className="terminal-bg-layer terminal-bg-layer--stars-near">
				<div className="terminal-starfield terminal-starfield-near absolute inset-0" />
			</div>
			<div className="terminal-vignette absolute inset-0" />
			<div className="terminal-bg-layer terminal-bg-layer--grid">
				<div className="terminal-grid absolute inset-0" />
			</div>
			<div className="terminal-bg-layer terminal-bg-layer--plot">
				<div className="terminal-plot-lines absolute inset-0" />
			</div>
			<NavigationGeometry />
			<ShipSchematic />
			<div className="terminal-bg-layer terminal-bg-layer--markings">
				<div className="terminal-markings absolute inset-0" />
			</div>
		</div>
	);
}
