import {
	BookOpen,
	Compass,
	FileText,
	MessageSquare,
	Radio,
	ScrollText,
	Settings,
	Shield,
	Users,
	type LucideIcon,
} from 'lucide-react';

const ICON_MAP: Record<string, LucideIcon> = {
	radio: Radio,
	message: MessageSquare,
	users: Users,
	shield: Shield,
	compass: Compass,
	microscope: BookOpen,
	scroll: ScrollText,
	logs: FileText,
	settings: Settings,
};

interface AppIconRendererProps {
	icon: string;
	size?: number;
	className?: string;
}

export function AppIconRenderer({ icon, size = 24, className = '' }: AppIconRendererProps) {
	const IconComponent = ICON_MAP[icon] ?? Shield;
	return <IconComponent size={size} className={className} strokeWidth={1.75} />;
}
