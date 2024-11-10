import { Home, CalendarPlus, Users } from "lucide-react";

import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarSeparator,
} from "@/components/ui/sidebar";
import { UserButton, useUser } from "@clerk/nextjs";
import React from "react";

// Menu items
const items = [
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
		url: "#",
		icon: Users,
	},
];

export function AppSidebar() {
	const { user } = useUser();
	return (
		<Sidebar>
			<SidebarContent className="bg-[#0F1C26]">
				<SidebarHeader className="bg-[#0F1C26] border-b border-[#00A3FF] flex flex-col items-center">
          <img className="w-12 h-12" src="/images/gorilla_logo.png" alt="" />
					<h2 className="text-white">Gorillák Roster Management</h2>
				</SidebarHeader>
				<SidebarGroup>
					<SidebarGroupContent>
						<SidebarMenu>
							{items.map((item) => (
								<SidebarMenuItem key={item.title} className="hover:text-black">
									<SidebarMenuButton asChild>
										<a href={item.url}>
											<item.icon className="text-white hover:text-black" />
											<span className="text-white">{item.title}</span>
										</a>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
			<SidebarSeparator />
			<SidebarFooter className="bg-[#0F1C26] border-t border-[#00A3FF]">
				<div className="flex justify-around">
					<h1 className="text-white">{user?.fullName}</h1>
					<UserButton />
				</div>
			</SidebarFooter>
		</Sidebar>
	);
}
