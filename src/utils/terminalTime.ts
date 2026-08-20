export function formatStardate(date: Date): string {
	const year = date.getFullYear();
	const start = new Date(year, 0, 0);
	const diff = date.getTime() - start.getTime();
	const day = Math.floor(diff / 86_400_000);
	const fraction = (day / 365).toFixed(2).slice(2);
	return `STARDATE ${String(year).slice(2)}${day}.${fraction}`;
}

export function formatClock(date: Date): string {
	const hours = date.getHours().toString().padStart(2, '0');
	const minutes = date.getMinutes().toString().padStart(2, '0');
	return `${hours}:${minutes}`;
}

export function formatShortDate(date: Date): string {
	return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
}
