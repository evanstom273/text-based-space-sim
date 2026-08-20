import { useEffect, useState } from 'react';
import { useIsMobile } from './useIsMobile';

export function useIsPortraitMobile(breakpoint = 640): boolean {
	const isMobile = useIsMobile(breakpoint);
	const [isPortrait, setIsPortrait] = useState(() =>
		typeof window !== 'undefined'
			? window.matchMedia('(orientation: portrait)').matches
			: false,
	);

	useEffect(() => {
		const mediaQuery = window.matchMedia('(orientation: portrait)');
		const update = () => setIsPortrait(mediaQuery.matches);
		update();
		mediaQuery.addEventListener('change', update);
		return () => mediaQuery.removeEventListener('change', update);
	}, []);

	return isMobile && isPortrait;
}
