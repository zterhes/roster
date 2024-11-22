import { Home, CalendarPlus, Users } from "lucide-react";

import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarSeparator,
} from "@/components/ui/sidebar";
import { UserButton, useUser } from "@clerk/nextjs";
import React from "react";
import Image from "next/image";

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
		url: "/players",
		icon: Users,
	},
];

export function AppSidebar() {
	const { user } = useUser();
	return (
		<Sidebar>
			<SidebarContent className="bg-[#0F1C26]">
				<SidebarHeader className="bg-[#0F1C26] border-b border-[#00A3FF] flex flex-col items-center">
					<Image width={50} height={50} src="/images/gorilla_logo.png" alt="" />
					<h2 className="text-white">Gorillák Roster Management</h2>
				</SidebarHeader>
				<SidebarGroup>
					<SidebarGroupContent>
						<SidebarMenu>
							{items.map((item) => (
								<SidebarMenuItem key={item.title}>
									<SidebarMenuButton asChild className="hover:bg-[#00A3FF] hover:scale-105 transition-all duration-200 ease-in-out ">
										<a href={item.url}>
											<item.icon className="text-white" />
											<span className="text-white ">{item.title}</span>
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
