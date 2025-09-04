"use client";

import * as React from "react";
import { BookOpen, Bot, Link, Activity } from "lucide-react";

import { NavMain } from "@/components/sidebar/nav-main";
import { NavUser } from "@/components/sidebar/nav-user";
import {
	Sidebar,
	SidebarContent,
	SidebarHeader,
	SidebarRail,
} from "@/components/ui/sidebar";

const data = {
	plan: [
		{
			type: "Enterprise",
		},
	],
	navMain: [
		{
			title: "Shortlinks",
			url: "#",
			icon: Link,
			items: [
				{
					title: "Create",
					url: "/dashboard?tab=create_shortlinks",
				},
				{
					title: "Manage",
					url: "/dashboard?tab=manage_shortlinks",
				},
			],
		},
		{
			title: "IPs Management",
			url: "#",
			icon: Bot,
			items: [
				{
					title: "Whitelisted Ips",
					url: "/dashboard?tab=whitelisted_ips",
				},
				{
					title: "Blacklisted Ips",
					url: "/dashboard?tab=blacklisted_ips",
				},
			],
		},
		{
			title: "Statistics",
			url: "#",
			icon: Activity,
			items: [
				{
					title: "Views",
					url: "/dashboard?tab=statisctics",
				},
			],
		},
		{
			title: "Documentation",
			url: "#",
			icon: BookOpen,
			items: [
				{
					title: "Introduction",
					url: "#",
				},
				{
					title: "Get Started",
					url: "#",
				},
				{
					title: "Tutorials",
					url: "#",
				},
				{
					title: "Changelog",
					url: "#",
				},
			],
		},
	],
};
export function EntitySidebar({ entity, props }) {
	return (
		<Sidebar collapsible="icon" {...props}>
			<SidebarHeader>
				<NavUser
					user={entity.username}
					subscription={entity.subscriptionType}
					apikey={entity.apikey}
				/>
			</SidebarHeader>
			<SidebarContent>
				<NavMain items={data.navMain} />
			</SidebarContent>
			<SidebarRail />
		</Sidebar>
	);
}
