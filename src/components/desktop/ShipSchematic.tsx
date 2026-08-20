export function ShipSchematic() {
	return (
		<div className="terminal-ship-wrap pointer-events-none absolute inset-0" aria-hidden="true">
			<svg
				className="terminal-ship-schematic"
				viewBox="0 0 420 520"
				fill="none"
				preserveAspectRatio="xMidYMid meet"
			>
				<defs>
					<pattern id="ship-blueprint-grid" width="20" height="20" patternUnits="userSpaceOnUse">
						<path
							d="M 20 0 L 0 0 0 20"
							fill="none"
							stroke="rgba(240,240,244,0.04)"
							strokeWidth="0.4"
						/>
					</pattern>
				</defs>
				<rect
					x="140"
					y="40"
					width="280"
					height="420"
					fill="url(#ship-blueprint-grid)"
					opacity="0.6"
				/>

				<g className="ship-layer-hull">
					<ellipse cx="280" cy="118" rx="78" ry="36" stroke="currentColor" strokeWidth="1.8" />
					<ellipse cx="280" cy="118" rx="52" ry="20" stroke="currentColor" strokeWidth="0.9" opacity="0.75" />
					<path d="M280 154 L280 200" stroke="currentColor" strokeWidth="1.5" />
					<path
						d="M244 200 L316 200 L322 232 L238 232 Z"
						stroke="currentColor"
						strokeWidth="1.6"
						strokeLinejoin="bevel"
					/>
					<path
						d="M254 232 L254 348 L306 348 L306 232"
						stroke="currentColor"
						strokeWidth="1.5"
						strokeLinejoin="bevel"
					/>
					<path
						d="M244 348 L316 348 L304 400 L256 400 Z"
						stroke="currentColor"
						strokeWidth="1.6"
						strokeLinejoin="bevel"
					/>
					<path
						d="M256 400 L304 400 L292 438 L268 438 Z"
						stroke="currentColor"
						strokeWidth="1.4"
						strokeLinejoin="bevel"
					/>
				</g>

				<g className="ship-layer-nacelles">
					<path
						d="M238 232 L160 252 L150 272 L160 292 L238 272"
						stroke="currentColor"
						strokeWidth="1.1"
						strokeLinejoin="bevel"
					/>
					<path
						d="M322 232 L400 252 L410 272 L400 292 L322 272"
						stroke="currentColor"
						strokeWidth="1.1"
						strokeLinejoin="bevel"
					/>
					<ellipse cx="140" cy="272" rx="30" ry="11" stroke="currentColor" strokeWidth="1" />
					<ellipse cx="420" cy="272" rx="30" ry="11" stroke="currentColor" strokeWidth="1" />
				</g>

				<g className="ship-layer-detail" opacity="0.55">
					<path d="M264 212 L296 212" stroke="currentColor" strokeWidth="0.5" className="ship-line-pulse" />
					<path
						d="M260 284 L300 284"
						stroke="currentColor"
						strokeWidth="0.5"
						className="ship-line-pulse ship-line-pulse--delay"
					/>
					<path d="M260 316 L300 316" stroke="currentColor" strokeWidth="0.5" />
					<path
						d="M266 368 L294 368"
						stroke="currentColor"
						strokeWidth="0.5"
						className="ship-line-pulse ship-line-pulse--delay2"
					/>
				</g>

				<g className="ship-layer-accent">
					<circle cx="280" cy="118" r="4" className="ship-marker-gold ship-node-pulse" />
					<circle cx="280" cy="272" r="3" className="ship-marker-purple ship-node-pulse ship-node-pulse--delay" />
					<circle cx="254" cy="212" r="2" className="ship-marker-purple ship-node-pulse ship-node-pulse--delay2" />
					<path
						d="M268 438 L292 438"
						stroke="currentColor"
						strokeWidth="1.5"
						className="ship-marker-gold ship-line-pulse"
					/>
				</g>
			</svg>
		</div>
	);
}
