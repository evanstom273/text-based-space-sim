export function NavigationGeometry() {
	return (
		<div className="nav-geometry-wrap pointer-events-none absolute inset-0" aria-hidden="true">
			<svg
				className="nav-geometry-svg"
				viewBox="0 0 420 520"
				fill="none"
				preserveAspectRatio="xMidYMid meet"
			>
				<g transform="translate(280, 260)">
					<g className="nav-rotate-slow">
						<circle cx="0" cy="0" r="190" stroke="currentColor" strokeWidth="0.5" opacity="0.35" />
						<circle cx="0" cy="0" r="150" stroke="currentColor" strokeWidth="0.4" opacity="0.28" />
					</g>

					<g className="nav-rotate-reverse">
						<circle cx="0" cy="0" r="110" stroke="currentColor" strokeWidth="0.45" opacity="0.32" />
						<path
							d="M0 -110 L0 110 M-110 0 L110 0"
							stroke="currentColor"
							strokeWidth="0.3"
							opacity="0.22"
						/>
					</g>

					<g className="nav-rotate-sweep">
						<line
							x1="0"
							y1="0"
							x2="0"
							y2="-188"
							stroke="currentColor"
							strokeWidth="0.6"
							opacity="0.18"
						/>
					</g>
				</g>

				<circle r="2" className="nav-travel-dot nav-travel-dot--a" fill="currentColor">
					<animateMotion
						dur="90s"
						repeatCount="indefinite"
						path="M 280,70 A 190,190 0 1,1 279.9,70"
					/>
				</circle>
				<circle r="1.5" className="nav-travel-dot nav-travel-dot--b" fill="currentColor">
					<animateMotion
						dur="120s"
						repeatCount="indefinite"
						path="M 390,260 A 130,130 0 1,1 389.9,260"
					/>
				</circle>

				<circle cx="340" cy="180" r="1.5" className="nav-pulse-node" />
				<circle cx="210" cy="320" r="1.5" className="nav-pulse-node nav-pulse-node--delay" />
			</svg>
		</div>
	);
}
