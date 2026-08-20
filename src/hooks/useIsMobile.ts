import { useEffect, useState } from 'react';

export function useIsMobile(breakpoint = 640): boolean {
	const [isMobile, setIsMobile] = useState(() =>
		typeof window !== 'undefined' ? window.innerWidth < breakpoint : false,
	);

	useEffect(() => {
		const mediaQuery = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
		const handleChange = () => setIsMobile(mediaQuery.matches);
		handleChange();
		mediaQuery.addEventListener('change', handleChange);
		return () => mediaQuery.removeEventListener('change', handleChange);
	}, [breakpoint]);

	return isMobile;
}
