export function ShipInsignia({ className = '', size = 24 }: { className?: string; size?: number }) {
	return (
		<svg
			viewBox="0 0 32 32"
			width={size}
			height={size}
			className={className}
			aria-hidden="true"
		>
			<path
				d="M16 2 L28 10 L24 16 L28 22 L16 30 L4 22 L8 16 L4 10 Z"
				fill="none"
				stroke="currentColor"
				strokeWidth="1.2"
				strokeLinejoin="bevel"
			/>
			<path
				d="M16 8 L22 12 L20 16 L22 20 L16 24 L10 20 L12 16 L10 12 Z"
				fill="none"
				stroke="currentColor"
				strokeWidth="0.8"
				strokeLinejoin="bevel"
				opacity="0.7"
			/>
			<circle cx="16" cy="16" r="2" fill="currentColor" opacity="0.85" />
		</svg>
	);
}
