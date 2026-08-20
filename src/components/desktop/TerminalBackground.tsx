import { ShipSchematic } from './ShipSchematic';

export function TerminalBackground() {
	return (
		<div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
			<div className="terminal-vignette absolute inset-0" />
			<div className="terminal-atmosphere absolute inset-0" />
			<div className="terminal-grid absolute inset-0" />
			<div className="terminal-plot-lines absolute inset-0" />
			<div className="terminal-starfield absolute inset-0" />
			<ShipSchematic />
			<div className="terminal-radar absolute inset-0" />
			<div className="terminal-markings absolute inset-0" />
		</div>
	);
}
