export function TerminalBackground() {
	return (
		<div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
			<div className="terminal-grid absolute inset-0" />
			<div className="terminal-starfield absolute inset-0" />
			<div className="terminal-radar absolute inset-0" />
			<svg
				className="terminal-ship-schematic absolute right-[-2%] top-[8%] h-[72%] w-[58%] opacity-[0.07]"
				viewBox="0 0 400 240"
				fill="none"
			>
				<ellipse cx="200" cy="120" rx="95" ry="38" stroke="currentColor" strokeWidth="0.8" />
				<path
					d="M200 82 L200 42 M200 158 L200 198 M105 120 L55 120 M295 120 L345 120"
					stroke="currentColor"
					strokeWidth="0.6"
					opacity="0.8"
				/>
				<rect x="165" y="108" width="70" height="24" stroke="currentColor" strokeWidth="0.7" />
				<path
					d="M145 120 L105 120 L95 112 L95 128 Z M255 120 L295 120 L305 112 L305 128 Z"
					stroke="currentColor"
					strokeWidth="0.7"
				/>
				<path
					d="M200 42 L188 28 L212 28 Z M200 198 L188 212 L212 212 Z"
					stroke="currentColor"
					strokeWidth="0.6"
				/>
				<circle cx="200" cy="120" r="62" stroke="currentColor" strokeWidth="0.5" opacity="0.5" />
				<circle cx="200" cy="120" r="88" stroke="currentColor" strokeWidth="0.4" opacity="0.35" />
			</svg>
			<div className="terminal-markings absolute inset-0" />
		</div>
	);
}
