import { Home, CalendarPlus, Users, Image as ImageIcon } from "lucide-react";

export const routes = [
	{
		title: "Home",
		url: "/",
		icon: Home,
	},
	{
		title: "Create Roster",
		url: "/create/roster",
		icon: CalendarPlus,
	},
	{
		title: "Players",
		url: "/players",
		icon: Users,
	},
	{
		title: "Default Images",
		url: "/upload/default-images",
		icon: ImageIcon,
	},
];
