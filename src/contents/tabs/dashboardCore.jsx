"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	Tooltip,
	ResponsiveContainer,
} from "recharts";
import { Activity, MousePointerClick, ShieldCheckIcon } from "lucide-react";
import EntityButtonLoading from "@/components/ui/entityButtonLoading";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";

export default function DashboardCoreTab({ owner }) {
	const [visitors, setVisitors] = useState([]);
	const [loading, setLoading] = useState(true);
	const [entity, setEntity] = useState(null);
	const [successRate, setSuccessRate] = useState(null);

	useEffect(() => {
		const fetchUserInfo = async () => {
			try {
				const res = await fetch(`/api/users/live?username=${owner}`);
				const data = await res.json();
				if (data.success) {
					setEntity(data.user);
				}
			} catch (err) {
				console.error("failed to fetch users:", err);
			} finally {
				setLoading(false);
			}
		};
		if (owner) fetchUserInfo();
	}, [owner]);

	useEffect(() => {
		const fetchVisitors = async () => {
			try {
				const res = await fetch(`/api/visitors/list?owner=${owner}`);
				const data = await res.json();
				if (data.success) {
					setVisitors(data.visitors);
				}
			} catch (err) {
				console.error("Failed to fetch visitors:", err);
			} finally {
				setLoading(false);
			}
		};
		if (owner) fetchVisitors();

		const interval = setInterval(fetchVisitors, 5000);
		return () => clearInterval(interval);
	}, [owner]);

	useEffect(() => {
		const fetchSuccessRate = async () => {
			try {
				const res = await fetch(`/api/status/succesRate?owner=${owner}`);
				const data = await res.json();
				if (data.success) {
					setSuccessRate(data.data.rate);
				}
			} catch (err) {
				console.error("Failed to fetch success rate:", err);
			}
		};

		fetchSuccessRate();
		const interval = setInterval(fetchSuccessRate, 5000);
		return () => clearInterval(interval);
	}, []);

	const uniqueUsers = new Set(visitors.map((v) => v.visitorIp)).size;
	const totalClicks = new Set(
		visitors.filter((v) => !v.isBlocked).map((v) => v.visitorIp)
	).size;

	const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
	const clicksByDay = weekdays.map((day) => ({ name: day, clicks: 0 }));

	const dayMap = {};

	visitors.forEach((v) => {
		if (!v.isBlocked) {
			const ts = new Date(v.timestamp);
			const day = ts.getDay();

			const key = `${day}-${v.visitorIp}`;
			if (!dayMap[key]) {
				clicksByDay[day].clicks += 1;
				dayMap[key] = true;
			}
		}
	});

	const seenIps = new Set();
	const recentVisitors = visitors
		.filter((v) => {
			if (seenIps.has(v.visitorIp)) return false;
			seenIps.add(v.visitorIp);
			return true;
		})
		.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
		.slice(0, 9999999);

	const countryCounts = visitors.reduce((acc, v) => {
		if (!v.isBlocked || v.isBlocked) {
			const country = (v.visitorCountry || "Unknown").toUpperCase();
			acc[country] = (acc[country] || 0) + 1;
		}
		return acc;
	}, {});

	const total = Object.values(countryCounts).reduce((a, b) => a + b, 0);
	const countryStats = Object.entries(countryCounts)
		.map(([country, count]) => ({
			country,
			count,
			percent: ((count / total) * 100).toFixed(1),
		}))
		.sort((a, b) => b.count - a.count);

	return (
		<div className="p-6 grid gap-6 min-h-[70vh]">
			<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
				<Card className="shadow-md rounded-2xl">
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-sm font-medium">Total Users</CardTitle>
						<Image
							src="/users.svg"
							alt="users"
							width={1}
							height={1}
							className="w-5 h-5"
						/>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{loading ? (
								<EntityButtonLoading
									className={"w-5 h-5 mt-3 fill-black dark:fill-white"}
								/>
							) : (
								uniqueUsers
							)}
						</div>
						<p className="text-xs text-muted-foreground">Visitors recorded</p>
					</CardContent>
				</Card>

				<Card className="shadow-md rounded-2xl">
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-sm font-medium">Allowed</CardTitle>
						<ShieldCheckIcon className="h-5 w-5 text-green-600" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{loading ? (
								<EntityButtonLoading
									className={"w-5 h-5 mt-3 fill-black dark:fill-white"}
								/>
							) : (
								totalClicks
							)}
						</div>
						<p className="text-xs text-muted-foreground">
							All-time allowed visitors
						</p>
					</CardContent>
				</Card>

				<Card className="shadow-md rounded-2xl">
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-sm font-medium">
							Total Shortlink
						</CardTitle>
						<Image
							src="/link.svg"
							alt="link"
							width={1}
							height={1}
							className="w-5 h-5"
						/>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{loading ? (
								<EntityButtonLoading className="w-5 h-5 mt-3 fill-black dark:fill-white" />
							) : entity?.totalShortlinks > 0 ? (
								entity.totalShortlinks
							) : (
								0
							)}
						</div>
						<p className="text-xs text-muted-foreground">Shortlinks Created</p>
					</CardContent>
				</Card>

				<Card className="shadow-md rounded-2xl">
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-sm font-medium">
							Real Human Rate
						</CardTitle>
						<Image
							src="/percent.svg"
							alt="percent"
							width={1}
							height={1}
							className="w-4 h-4"
						/>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{successRate !== null ? (
								`${successRate}%`
							) : (
								<EntityButtonLoading className="w-5 h-5 mt-3 fill-black dark:fill-white" />
							)}
						</div>
						<p className="text-xs text-muted-foreground">Humans Verified</p>
					</CardContent>
				</Card>
			</div>

			<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
				<Card className="shadow-md rounded-2xl max-h-[440px]">
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-sm font-medium">Weekly Clicks</CardTitle>
						<MousePointerClick className="h-5 w-5 text-purple-600" />
					</CardHeader>
					<CardContent className="h-[400px] -ml-10">
						<ResponsiveContainer width="100%" height="100%">
							<BarChart data={clicksByDay}>
								<XAxis dataKey="name" />
								<YAxis allowDecimals={false} />
								<Tooltip />
								<Bar dataKey="clicks" fill="#4f46e5" radius={[6, 6, 0, 0]} />
							</BarChart>
						</ResponsiveContainer>
					</CardContent>
				</Card>

				<Card className="shadow-md rounded-2xl max-h-[440px] scroll">
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-sm font-medium">
							Recent Activity
						</CardTitle>
						<Activity className="h-5 w-5 text-red-700" />
					</CardHeader>
					<CardContent className="space-y-4">
						{loading ? (
							<div className="flex flex-col gap-[25.1px]">
								{Array.from({ length: 9 }).map((_, i) => (
									<div key={i}>
										<div className="flex justify-between">
											<Skeleton className="w-42 h-4 bg-neutral-900/10" />
											<Skeleton className="w-18 h-4 bg-neutral-900/10" />
										</div>
									</div>
								))}
							</div>
						) : recentVisitors.length === 0 ? (
							<p className="text-sm text-muted-foreground">
								No recent activity
							</p>
						) : (
							recentVisitors.map((v, i) => (
								<div
									key={i}
									className="flex items-center justify-between border-b pb-1 p-1"
								>
									<span className="text-sm">
										{v.visitorIp} ({v.deviceType})
									</span>
									<span className="text-xs text-muted-foreground">
										{new Date(v.timestamp).toLocaleTimeString()}
									</span>
								</div>
							))
						)}
					</CardContent>
				</Card>

				<Card className="shadow-md rounded-2xl max-h-[440px] scroll">
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-sm font-medium">
							Visitors by Country
						</CardTitle>
						<Image
							src="/country.svg"
							alt="country"
							width={1}
							height={1}
							className="w-5 h-5"
						/>
					</CardHeader>
					<CardContent className="space-y-4">
						{loading ? (
							<div className="flex flex-col gap-[15px]">
								{Array.from({ length: 9 }).map((_, i) => (
									<div key={i} className="flex justify-between">
										<Skeleton className="w-7 h-6 bg-neutral-900/10" />
										<Skeleton className="w-12 h-5 bg-neutral-900/10" />
									</div>
								))}
							</div>
						) : countryStats.length === 0 ? (
							<p className="text-sm text-muted-foreground">No country data</p>
						) : (
							countryStats.map((c, i) => (
								<div
									key={i}
									className="flex items-center justify-between text-sm border-b pb-1 p-1"
								>
									<Image
										src={`https://cdn.ipwhois.io/flags/${c.country.toLowerCase()}.svg`}
										alt={`${c.country} flag`}
										width={1}
										height={1}
										className="w-5"
									/>
									<span>{c.percent}%</span>
								</div>
							))
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
