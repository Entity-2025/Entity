"use client";

import * as React from "react";
import {
	Settings2,
	Bell,
	ChevronsUpDown,
	CreditCard,
	LogOut,
	Key,
	ChevronLeft,
} from "lucide-react";

import { EntityAvatar } from "@/components/ui/entityAvatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "@/components/ui/sidebar";
import { useEffect, useState, useRef } from "react";
import {
	AlertDialog,
	AlertDialogContent,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	ApiKeySkeleton,
	UsernameSkeleton,
} from "@/components/loading/entitySkeleton";
import EntityButtonLoading from "@/components/loading/entityButtonLoading";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export function NavUser({ user }) {
	const { isMobile } = useSidebar();
	const router = useRouter();

	const [entity, setEntity] = useState(null);
	const [notifications, setNotifications] = useState([]);
	const [unreadCount, setUnreadCount] = useState(0);
	const [countdown, setCountdown] = useState("");
	const [loading, setLoading] = useState(false);

	const [openApiKeyDialog, setOpenApiKeyDialog] = useState(false);
	const [openBillingDialog, setOpenBillingDialog] = useState(false);
	const [openNotificationsDialog, setOpenNotificationsDialog] = useState(false);

	const logoutTimerRef = useRef(null);
	const countdownTimerRef = useRef(null);

	const formatCountdown = (ms) => {
		const seconds = Math.floor(ms / 1000) % 60;
		const minutes = Math.floor(ms / (1000 * 60)) % 60;
		const hours = Math.floor(ms / (1000 * 60 * 60)) % 24;
		const days = Math.floor(ms / (1000 * 60 * 60 * 24));

		if (days > 0) return `${days}d ${hours}h ${minutes}m ${seconds}s`;
		if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
		if (minutes > 0) return `${minutes}m ${seconds}s`;
		return `${seconds}s`;
	};

	const handleLogout = async () => {
		try {
			await fetch("/api/users/downgrade", { method: "POST" });
			await fetch("/api/users/logout", { method: "POST" });
		} finally {
			router.push("/login");
		}
	};

	const SignOut = async () => {
		const res = await fetch("/api/users/logout", { method: "POST" });
		if (res.ok) router.push("/login");
	};

	const handleUpgrade = async (plan) => {
		setLoading(true);
		try {
			await toast.promise(
				(async () => {
					const res = await fetch("/api/users/upgrade", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({ plan }),
					});

					const data = await res.json();
					setLoading(false);

					if (!res.ok) {
						throw new Error(
							data.message || "[ERROR] Failed to update subscription"
						);
					}

					setEntity((prev) => ({
						...prev,
						subscriptionType: plan,
						expiresAt: data.expiresAt,
					}));

					setOpenBillingDialog(false);
					router.push("/login");

					return data.message || "[SUCCESS] Subscription updated!";
				})(),
				{
					icon: null,
					loading: (
						<div className="flex gap-2">
							<EntityButtonLoading className="invert-0 w-5 h-5" />
							<span>Upgrading Account...</span>
						</div>
					),
					success: (msg) => `[SUCCESS] ${msg}`,
					error: (err) => `[ERROR] ${err.message}`,
				}
			);
		} catch (err) {
			console.error("Upgrade error", err);
		}
	};

	useEffect(() => {
		if (!user) return;
		const controller = new AbortController();

		const fetchUser = async () => {
			try {
				const res = await fetch(`/api/users/entity/live?username=${user}`, {
					cache: "no-store",
					signal: controller.signal,
				});

				if (!res.ok) throw new Error("Fetch failed");

				const data = await res.json();
				const u = data.user;
				setEntity(u);

				if (!u || (u.expiresAt && new Date(u.expiresAt) <= new Date())) {
					await SignOut();
					return;
				}

				clearTimeout(logoutTimerRef.current);
				clearInterval(countdownTimerRef.current);

				if (u.expiresAt) {
					const msUntilExpire = new Date(u.expiresAt) - Date.now();
					logoutTimerRef.current = setTimeout(handleLogout, msUntilExpire);

					countdownTimerRef.current = setInterval(() => {
						const remaining = new Date(u.expiresAt) - new Date();
						if (remaining <= 0) {
							setCountdown("Expired");
							clearInterval(countdownTimerRef.current);
						} else {
							setCountdown(formatCountdown(remaining));
						}
					}, 1000);
				}
			} catch (err) {
				if (err.name !== "AbortError") {
					setEntity(null);
					await SignOut();
				}
			}
		};

		fetchUser();
		const interval = setInterval(fetchUser, 5000);

		return () => {
			controller.abort();
			clearInterval(interval);
			clearTimeout(logoutTimerRef.current);
			clearInterval(countdownTimerRef.current);
		};
	}, [user, router]);

	useEffect(() => {
		const fetchNotifications = async () => {
			try {
				const res = await fetch("/api/users/notifications");
				if (res.ok) {
					const data = await res.json();
					setNotifications(data.notifications || []);
					setUnreadCount(data.notifications.filter((n) => !n.read).length);
				}
			} catch (err) {
				console.error("Notifications fetch error:", err);
			}
		};

		fetchNotifications();
		if (openNotificationsDialog) fetchNotifications();
	}, [openNotificationsDialog]);

	useEffect(() => {
		if (openNotificationsDialog && unreadCount > 0) {
			setUnreadCount(0);
			fetch("/api/users/notifications/mark-read", { method: "POST" });
		}
	}, [openNotificationsDialog, unreadCount]);

	function CopyButton({ text }) {
		const [copied, setCopied] = useState(false);

		const handleCopy = async () => {
			await navigator.clipboard.writeText(text);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		};

		return (
			<Button
				variant="ghost"
				size="icon"
				className="h-6 w-6"
				onClick={handleCopy}
				title="Copy Apikey"
			>
				{copied ? (
					<Check className="h-4 w-4 text-green-500" />
				) : (
					<Copy className="h-4 w-4" />
				)}
			</Button>
		);
	}

	return (
		<>
			<AlertDialog open={openApiKeyDialog} onOpenChange={setOpenApiKeyDialog}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Your API Key</AlertDialogTitle>
						<AlertDialogDescription>
							Here’s your personal API key. Keep it safe.
						</AlertDialogDescription>
					</AlertDialogHeader>

					<div className="rounded border p-3 font-mono text-xs flex items-center justify-between gap-2">
						{!entity?.apikey ? (
							<ApiKeySkeleton />
						) : (
							<>
								<p className="truncate max-w-[180px] sm:max-w-[400px]">
									{entity?.apikey}
								</p>
								<CopyButton text={entity?.apikey} />
							</>
						)}
					</div>

					<AlertDialogFooter>
						<AlertDialogCancel onClick={() => setOpenApiKeyDialog(false)}>
							<ChevronLeft />
						</AlertDialogCancel>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
			<AlertDialog open={openBillingDialog} onOpenChange={setOpenBillingDialog}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Your Billing Info</AlertDialogTitle>
						<AlertDialogDescription>
							You can see your current plan and upgrade your from here.
						</AlertDialogDescription>
					</AlertDialogHeader>

					<div className="p-3 border rounded-lg mb-4">
						<p className="font-semibold">
							Current Plan :{" "}
							<span
								className={
									entity?.subscriptionType === "free"
										? "text-red-700"
										: entity?.subscriptionType === "pro"
										? "text-blue-700"
										: ""
								}
							>
								{entity?.subscriptionType
									? entity?.subscriptionType.charAt(0).toUpperCase() +
									  entity?.subscriptionType.slice(1).toLowerCase()
									: "Unknown"}
							</span>
						</p>

						{entity?.expiresAt && (
							<p className="flex text-sm mt-1 gap-2">
								Expires in :{" "}
								{countdown || (
									<EntityButtonLoading className="invert-0 w-5 h-5" />
								)}
							</p>
						)}
					</div>

					<Button
						variant={"default"}
						onClick={() => {
							router.push("/dashboard?tab=subscriptions");
							setOpenBillingDialog(false);
						}}
						className={"flex items-center justify-center"}
					>
						{loading ? (
							<EntityButtonLoading className="invert-0 w-5 h-5" />
						) : (
							<span>UPGRADE PLAN</span>
						)}
					</Button>

					<AlertDialogFooter>
						<AlertDialogCancel onClick={() => setOpenBillingDialog(false)}>
							<ChevronLeft />
						</AlertDialogCancel>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
			<AlertDialog
				open={openNotificationsDialog}
				onOpenChange={setOpenNotificationsDialog}
			>
				<AlertDialogContent className="max-h-[80vh] overflow-y-auto">
					<AlertDialogHeader>
						<AlertDialogTitle>Your Notifications</AlertDialogTitle>
						<AlertDialogDescription>
							All notifications will be stored here
						</AlertDialogDescription>
					</AlertDialogHeader>

					<div className="space-y-3 mt-2">
						{notifications.length > 0 ? (
							notifications.map((n, i) => (
								<div
									key={i}
									className={`p-3 rounded-lg border ${
										n.read ? "" : "bg-yellow-100 dark:bg-yellow-900"
									}`}
								>
									{n.read ? (
										<p>{n.message}</p>
									) : (
										<div className="flex w-full justify-between">
											<p>{n.message}</p>
											<Badge className="h-5 min-w-5 rounded-full px-1 font-mono tabular-nums font-bold">
												New!
											</Badge>
										</div>
									)}
									<p className="text-xs font-bold text-blue-700 mt-1">
										{new Date(n.createdAt).toLocaleString()}
									</p>
								</div>
							))
						) : (
							<p className="text-sm text-gray-500">No notifications yet.</p>
						)}
					</div>

					<AlertDialogFooter>
						<AlertDialogCancel
							onClick={() => setOpenNotificationsDialog(false)}
						>
							<ChevronLeft />
						</AlertDialogCancel>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			<SidebarMenu>
				<SidebarMenuItem>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<SidebarMenuButton
								size="lg"
								className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
							>
								<div className="text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
									<EntityButtonLoading
										className={"invert dark:invert-0 w-22 h-22 animate-none"}
									/>
								</div>
								<div className="grid flex-1 text-left text-sm leading-tight">
									<span className="truncate font-semibold">
										{entity?.username ? (
											entity?.username.charAt(0).toUpperCase() +
											entity?.username.slice(1).toLowerCase()
										) : (
											<UsernameSkeleton />
										)}
									</span>
									<span
										className={
											entity?.subscriptionType === "free"
												? "text-red-700"
												: entity?.subscriptionType === "pro"
												? "text-blue-700"
												: ""
										}
									>
										{entity?.subscriptionType ? (
											entity?.subscriptionType.charAt(0).toUpperCase() +
											entity?.subscriptionType.slice(1).toLowerCase()
										) : (
											<EntityButtonLoading
												className={"invert-0 w-4 h-4 mt-1"}
											/>
										)}
									</span>
								</div>
								<ChevronsUpDown className="ml-auto size-4" />
							</SidebarMenuButton>
						</DropdownMenuTrigger>
						<DropdownMenuContent
							className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg sm:mt-2"
							side={isMobile ? "bottom" : "right"}
							align="end"
							sideOffset={4}
						>
							<DropdownMenuGroup>
								<DropdownMenuItem>
									<Settings2 />
									<p
										onClick={() => openUserProfile()}
										className={"w-full cursor-pointer"}
									>
										Manage Account
									</p>
								</DropdownMenuItem>
								<DropdownMenuItem onClick={() => setOpenApiKeyDialog(true)}>
									<Key />
									<p className={"w-full cursor-pointer"}>Your Apikey</p>
								</DropdownMenuItem>
								<DropdownMenuItem onClick={() => setOpenBillingDialog(true)}>
									<CreditCard />
									<p className="w-full cursor-pointer">Billing</p>
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={() => setOpenNotificationsDialog(true)}
								>
									<div className="flex justify-between w-full items-center">
										<Bell className="mr-2" />
										<p className="w-full cursor-pointer">Notifications</p>
										{unreadCount > 0 && (
											<>
												<Badge className="h-5 min-w-5 rounded-full px-1 font-bold tabular-nums">
													{unreadCount}
												</Badge>
											</>
										)}
									</div>
								</DropdownMenuItem>
							</DropdownMenuGroup>
							<DropdownMenuSeparator />
							<DropdownMenuItem>
								<LogOut />
								<p
									onClick={SignOut}
									className="text-red-800 font-semibold w-full cursor-pointer"
								>
									Sign out
								</p>
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</SidebarMenuItem>
			</SidebarMenu>
		</>
	);
}
