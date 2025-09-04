"use client";

import * as React from "react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import EntityButtonLoading from "@/components/loading/entityButtonLoading";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";
import { ClearStatisticIconSkeleton } from "./loading/entitySkeleton";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Tooltip,
	TooltipTrigger,
	TooltipContent,
} from "@/components/ui/tooltip";
import {
	AlertDialog,
	AlertDialogTrigger,
	AlertDialogContent,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogFooter,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogDescription,
} from "@/components/ui/alert-dialog";
import { ChevronLeft, TrashIcon } from "lucide-react";

const chartConfig = {
	desktop: {
		label: "Desktop",
		color: "var(--chart-1)",
	},
	mobile: {
		label: "Mobile",
		color: "var(--chart-2)",
	},
};

export function ChartData({
	user,
	activeChart,
	loading,
	total,
	selectedKey,
	chartData,
	shortlinks,
	setSelectedKey,
	clearOpen,
	setClearOpen,
	clearing,
	handleClearLogs,
	setActiveChart,
}) {
	if (!user) {
		<div className="flex items-center justify-center">
			<EntityButtonLoading className="invert dark:invert-0 w-22 h-22" />;
		</div>;
	}

	return (
		<Card className="py-0 h-full">
			<CardHeader className="flex flex-col items-stretch border-b !p-0 sm:flex-row">
				<div className="flex flex-1 flex-col justify-center gap-1 px-6 pt-4 pb-3 sm:!py-0">
					<CardTitle className="text-red-800 font-bold">
						{process.env.NEXT_PUBLIC_ORG}
					</CardTitle>
					<CardDescription>
						<i>Showing total visitors click.</i>
					</CardDescription>
				</div>

				<div className="flex">
					{["desktop", "mobile"].map((key) => (
						<button
							key={key}
							data-active={activeChart === key}
							className={`data-[active=true]:dark:bg-red-800 data-[active=true]:bg-red-700 relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l sm:border-t-0 sm:border-l sm:px-8 sm:py-6${
								key === "mobile" && activeChart === "mobile"
									? "rounded-none sm:rounded-tr-xl"
									: ""
							}`}
							onClick={() => setActiveChart(key)}
							disabled={loading}
						>
							<span className="text-xs">{chartConfig[key].label}</span>
							<span className="text-lg leading-none font-bold sm:text-3xl flex h-5 md:h-7 lg:h-8">
								{total[key].toLocaleString()}
							</span>
						</button>
					))}
				</div>
			</CardHeader>

			<div className="flex items-center gap-2 mb-4 px-2">
				{loading ? (
					<div className="flex items-center justify-center mx-auto">
						<EntityButtonLoading className="invert dark:invert-0 w-9 mx-auto" />
					</div>
				) : shortlinks.length === 0 ? (
					<p className="text-sm text-gray-500">No shortlinks available.</p>
				) : (
					<Select value={selectedKey} onValueChange={setSelectedKey}>
						<SelectTrigger>
							<SelectValue placeholder="Select a shortlink" />
						</SelectTrigger>
						<SelectContent>
							{shortlinks.map((link) => (
								<SelectItem key={link.shortlinkKey} value={link.shortlinkKey}>
									<Tooltip>
										<TooltipTrigger asChild>
											<p className="flex items-center gap-1 max-w-[160px] sm:max-w-[550px] md:max-w-[350px] lg:max-w-[550px] truncate overflow-hidden whitespace-nowrap text-xs sm:text-base">
												<span className="text-blue-700 truncate">
													{link.activeUrl}
												</span>
												<span className="text-green-700 font-bold">
													({link.shortlinkKey})
												</span>
											</p>
										</TooltipTrigger>
										<TooltipContent side="top" className="max-w-xs break-words">
											{link.activeUrl}
										</TooltipContent>
									</Tooltip>
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				)}

				{selectedKey ? (
					<AlertDialog open={clearOpen} onOpenChange={setClearOpen}>
						<AlertDialogTrigger asChild>
							<Tooltip>
								<TooltipTrigger asChild>
									<Button
										variant="outline"
										onClick={() => setClearOpen(true)}
										disabled={!selectedKey || clearing}
									>
										{clearing ? (
											<EntityButtonLoading className="invert dark:invert-0 w-5 h-5" />
										) : (
											<TrashIcon className="w-4 h-4 text-red-700" />
										)}
									</Button>
								</TooltipTrigger>
								<TooltipContent>
									<p>Clear Visitor Logs</p>
								</TooltipContent>
							</Tooltip>
						</AlertDialogTrigger>

						<AlertDialogContent>
							<AlertDialogDescription />
							<AlertDialogHeader>
								<AlertDialogTitle>
									Clear Logs for "{selectedKey}" ?
								</AlertDialogTitle>
							</AlertDialogHeader>
							<div>
								This will <b>permanently delete</b> all visitor logs for this
								shortlink.
							</div>
							<AlertDialogFooter>
								<AlertDialogCancel>
									<ChevronLeft />
								</AlertDialogCancel>
								<AlertDialogAction asChild>
									<Tooltip>
										<TooltipTrigger asChild>
											<Button
												type="button"
												variant="outline"
												onClick={() => {
													setClearOpen(false);
													handleClearLogs();
												}}
											>
												<TrashIcon className="h-4 w-4 text-red-700" />
											</Button>
										</TooltipTrigger>
										<TooltipContent>
											<p>Clear Visitor Logs</p>
										</TooltipContent>
									</Tooltip>
								</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>
				) : (
					<ClearStatisticIconSkeleton />
				)}
			</div>

			<CardContent className="px-2">
				<ChartContainer
					config={chartConfig}
					className="aspect-auto h-[250px] w-full"
				>
					<BarChart
						accessibilityLayer
						data={chartData}
						margin={{ left: 12, right: 12 }}
					>
						<CartesianGrid vertical={false} />
						<XAxis
							dataKey="info"
							tickLine={false}
							axisLine={false}
							tickMargin={8}
							minTickGap={32}
						/>
						<ChartTooltip
							content={
								<ChartTooltipContent className="w-[150px]" nameKey="views" />
							}
						/>
						<Bar dataKey={activeChart} fill={`var(--color-${activeChart})`} />
					</BarChart>
				</ChartContainer>
			</CardContent>
		</Card>
	);
}
