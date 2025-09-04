"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { EntitySidebar } from "@/components/sidebar/entitySidebar";
import EntityBreadcrumb from "@/components/entityBreadcrumb";
import { Separator } from "@/components/ui/separator";
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from "@/components/ui/sidebar";
import StatisticTab from "@/contents/tab/statistic";
import CreateShortlinksTab from "@/contents/tab/createShortlinks";
import ManageShortlinksTab from "@/contents/tab/manageShortlinks";
import WhitelistedIpsTab from "@/contents/tab/whitelistedIps";
import BlacklistedIpsTab from "@/contents/tab/blacklistedIps";
import CoreDashboard from "@/contents/tab/dashboardCore";
import { AnimatePresence, motion } from "motion/react";
import EntityLoading from "@/components/loading/entityLoading";
import useCountdown from "@/hooks/useCountdown";
import SubscriptionTab from "@/contents/tab/subscriptionTab";

export default function DashboardPageContents() {
	const [expiresAt, setExpiresAt] = useState(null);
	const [entity, setEntity] = useState(null);
	const router = useRouter();
	const searchParams = useSearchParams();
	const tab = searchParams.get("tab") || "core";

	useEffect(() => {
		const fetchUser = async () => {
			const res = await fetch("/api/users/entity");
			if (res.ok) {
				const data = await res.json();
				setEntity(data.user);
				setExpiresAt(data.expiresAt);
			} else {
				router.push("/login");
			}
		};

		fetchUser();
	}, []);

	useCountdown(expiresAt, () => {
		fetch("/api/users/logout", { method: "POST" }).finally(() => {
			router.push("/login");
		});
	});

	function renderTabComponent() {
		if (tab === "statisctics") {
			return <StatisticTab user={entity.username} apikey={entity.apikey} />;
		} else if (tab === "create_shortlinks") {
			return <CreateShortlinksTab user={entity.username} />;
		} else if (tab === "manage_shortlinks") {
			return <ManageShortlinksTab user={entity.username} />;
		} else if (tab === "whitelisted_ips") {
			return <WhitelistedIpsTab user={entity.username} />;
		} else if (tab === "blacklisted_ips") {
			return <BlacklistedIpsTab user={entity.username} />;
		} else if (tab === "subscriptions") {
			return <SubscriptionTab />;
		} else if (tab === "core") {
			return <CoreDashboard />;
		} else {
			return null;
		}
	}

	if (!entity) return <EntityLoading />;

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			transition={{ duration: 0.5, ease: "easeInOut" }}
		>
			<SidebarProvider>
				<EntitySidebar entity={entity} />
				<SidebarInset>
					<header className="flex justify-between h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
						<div className="flex items-center gap-2 px-4">
							<SidebarTrigger className="-ml-1" />
							<Separator
								orientation="vertical"
								className="mr-2 data-[orientation=vertical]:h-4"
							/>
							<EntityBreadcrumb
								items={[
									{ label: "Home", href: "/" },
									{
										label: "Dashboard",
										href: "/dashboard",
										active: !tab || tab === "core",
									},
									...(tab && tab !== "core"
										? [
												{
													label: tab
														.replace(/_/g, " ")
														.replace(/\b\w/g, (c) => c.toUpperCase()),
													active: true,
												},
										  ]
										: []),
								]}
							/>
						</div>
					</header>
					<AnimatePresence mode="wait">
						<motion.div
							key={tab}
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							transition={{ duration: 0.1, ease: "easeInOut" }}
						>
							{renderTabComponent(tab)}
						</motion.div>
					</AnimatePresence>
				</SidebarInset>
			</SidebarProvider>
		</motion.div>
	);
}
