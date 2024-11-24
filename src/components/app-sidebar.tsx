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
import { useOrganizationList, UserButton, useUser } from "@clerk/nextjs";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { routes } from "@/app/frontendRoutes";
import RosterLogo from "@/components/RosterLogo";
export function AppSidebar() {
	const { user } = useUser();
	const [orgImageUrl, setOrgImageUrl] = useState("");
	const [orgName, setOrgName] = useState("");

	//todo: fix this to use the userMemberships with state
	const { userMemberships } = useOrganizationList({ userMemberships: true });

	useEffect(() => {
		if (userMemberships?.data?.[0]) {
			setOrgImageUrl(userMemberships.data[0].organization.imageUrl);
			setOrgName(userMemberships.data[0].organization.name);
		}
	}, [userMemberships]);

	return (
		<Sidebar>
			<SidebarContent className="bg-[#0F1C26]">
				<SidebarHeader className="bg-[#0F1C26] border-b border-[#00A3FF] flex flex-col items-center">
					{orgImageUrl ? <Image width={50} height={50} src={orgImageUrl} alt="" /> : <RosterLogo />}

					<h2 className="text-white">{orgName} Roster Management</h2>
				</SidebarHeader>
				<SidebarGroup>
					<SidebarGroupContent>
						<SidebarMenu>
							{routes.map((item) => (
								<SidebarMenuItem key={item.title}>
									<SidebarMenuButton
										asChild
										className="hover:bg-[#00A3FF] hover:scale-105 transition-all duration-200 ease-in-out "
									>
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
