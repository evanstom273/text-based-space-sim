export function ShipSchematic() {
	return (
		<div className="terminal-ship-wrap pointer-events-none absolute inset-0" aria-hidden="true">
			<div className="terminal-ship-glow" />
			<svg
				className="terminal-ship-schematic"
				viewBox="0 0 420 520"
				fill="none"
				preserveAspectRatio="xMidYMid meet"
			>
				<g className="ship-layer-radar" opacity="0.2">
					<circle cx="280" cy="260" r="180" stroke="currentColor" strokeWidth="0.6" />
					<circle cx="280" cy="260" r="130" stroke="currentColor" strokeWidth="0.5" />
					<circle cx="280" cy="260" r="80" stroke="currentColor" strokeWidth="0.4" />
					<line x1="100" y1="260" x2="460" y2="260" stroke="currentColor" strokeWidth="0.35" />
					<line x1="280" y1="80" x2="280" y2="440" stroke="currentColor" strokeWidth="0.35" />
				</g>

				<g className="ship-layer-hull">
					<ellipse cx="280" cy="118" rx="72" ry="34" stroke="currentColor" strokeWidth="1.8" />
					<ellipse cx="280" cy="118" rx="48" ry="18" stroke="currentColor" strokeWidth="0.9" opacity="0.75" />
					<path
						d="M280 152 L280 198"
						stroke="currentColor"
						strokeWidth="1.5"
					/>
					<path
						d="M248 198 L312 198 L318 230 L242 230 Z"
						stroke="currentColor"
						strokeWidth="1.6"
						strokeLinejoin="bevel"
					/>
					<path
						d="M258 230 L258 340 L302 340 L302 230"
						stroke="currentColor"
						strokeWidth="1.5"
						strokeLinejoin="bevel"
					/>
					<path
						d="M248 340 L312 340 L300 392 L260 392 Z"
						stroke="currentColor"
						strokeWidth="1.6"
						strokeLinejoin="bevel"
					/>
					<path
						d="M260 392 L300 392 L288 430 L272 430 Z"
						stroke="currentColor"
						strokeWidth="1.4"
						strokeLinejoin="bevel"
					/>
				</g>

				<g className="ship-layer-nacelles">
					<path
						d="M242 230 L168 248 L158 268 L168 288 L242 270"
						stroke="currentColor"
						strokeWidth="1.1"
						strokeLinejoin="bevel"
					/>
					<path
						d="M318 230 L392 248 L402 268 L392 288 L318 270"
						stroke="currentColor"
						strokeWidth="1.1"
						strokeLinejoin="bevel"
					/>
					<ellipse cx="148" cy="268" rx="28" ry="10" stroke="currentColor" strokeWidth="1" />
					<ellipse cx="412" cy="268" rx="28" ry="10" stroke="currentColor" strokeWidth="1" />
					<path d="M148 258 L148 278" stroke="currentColor" strokeWidth="0.6" opacity="0.6" />
					<path d="M412 258 L412 278" stroke="currentColor" strokeWidth="0.6" opacity="0.6" />
				</g>

				<g className="ship-layer-accent">
					<circle cx="280" cy="118" r="4" className="ship-marker-gold" />
					<circle cx="280" cy="268" r="3" className="ship-marker-purple" />
					<path
						d="M272 430 L288 430"
						stroke="currentColor"
						strokeWidth="1.5"
						className="ship-marker-gold"
					/>
				</g>

				<g className="ship-layer-detail" opacity="0.5">
					<path d="M268 210 L292 210" stroke="currentColor" strokeWidth="0.5" />
					<path d="M264 280 L296 280" stroke="currentColor" strokeWidth="0.5" />
					<path d="M264 310 L296 310" stroke="currentColor" strokeWidth="0.5" />
					<path d="M270 360 L290 360" stroke="currentColor" strokeWidth="0.5" />
				</g>
			</svg>
		</div>
	);
}
