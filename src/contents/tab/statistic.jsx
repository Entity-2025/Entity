import { ChartData } from "@/components/chartData";
import { EntityStatistic } from "@/components/title/EntityTitle";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import EntityButtonLoading from "@/components/loading/entityButtonLoading";
import Image from "next/image";

export default function StatisticTab({ user, apikey }) {
	const [activeChart, setActiveChart] = useState("desktop");
	const [chartData, setChartData] = useState([]);
	const [loading, setLoading] = useState(true);
	const [shortlinks, setShortlinks] = useState([]);
	const [selectedKey, setSelectedKey] = useState("");
	const [clearing, setClearing] = useState(false);
	const [clearOpen, setClearOpen] = useState(false);
	const [total, setTotal] = useState({ desktop: 0, mobile: 0 });

	useEffect(() => {
		const fetchShortlinks = async () => {
			setLoading(true);
			if (!user) return;

			try {
				const res = await fetch(`/api/shortlinks/list?owner=${user}`);
				const data = await res.json();
				if (data.shortlinks?.length) {
					setShortlinks(data.shortlinks);
					setSelectedKey(data.shortlinks[0].shortlinkKey);
				}
			} catch (err) {
				console.error("Failed to fetch shortlinks:", err);
			} finally {
				setLoading(false);
			}
		};

		if (user) fetchShortlinks();
	}, [user]);

	useEffect(() => {
		let interval;

		const fetchData = async () => {
			if (!selectedKey) return;

			try {
				const res = await fetch(
					`/api/visitors/stats?shortlinkKey=${selectedKey}`
				);
				const data = await res.json();
				setChartData(data.chartData || []);
				setTotal(data.total || { desktop: 0, mobile: 0 });
			} catch (err) {
				console.error("Failed to fetch chart data:", err);
			}
		};

		if (user && selectedKey) {
			fetchData();
			interval = setInterval(fetchData, 5000);
		}

		return () => clearInterval(interval);
	}, [user, selectedKey]);

	const getTypeCount = (type) => {
		const found = chartData.find((d) => d.info === type);
		return found ? found : { desktop: 0, mobile: 0 };
	};

	const humans = getTypeCount("HUMANS");
	const bots = getTypeCount("BOTS");
	const blocked = getTypeCount("BLOCKED");

	const handleClearLogs = async () => {
		if (!selectedKey || !apikey) return;

		setClearing(true);

		await toast.promise(
			(async () => {
				const res = await fetch(`/api/visitors/clear/${selectedKey}`, {
					method: "POST",
					headers: {
						"x-entity-api-key": apikey,
					},
				});
				const result = await res.json();

				setClearing(false);

				if (result.success) {
					return "[SUCCESS] Logs cleared!";
				} else {
					throw new Error("[ERROR] Failed to clear logs.");
				}
			})(),
			{
				icon: null,
				loading: (
					<div className="flex gap-2">
						<EntityButtonLoading className="invert-0 dark:invert w-5 h-5" />
						<span>Clearing Visitor Logs...</span>
					</div>
				),
				success: (msg) => msg,
				error: (err) => err.message || "[?] Something went wrong.",
			}
		);
	};
	return (
		<div className={"p-4"}>
			<div className={"mb-6 -mt-2"}>
				<EntityStatistic className="w-42 h-5 sm:h-7" />
			</div>
			<div className="grid auto-rows-min gap-4 md:grid-cols-2 lg:grid-cols-4 mb-4">
				<div className="bg-muted/50 aspect-video rounded-xl border">
					<div className="flex h-full flex-col items-center justify-center gap-2 p-4">
						<Image
							src={"/users.svg"}
							alt="users"
							width={1}
							height={1}
							className="w-18 h-18 lg:w-11 lg:h-11 xl:w-16 xl:h-16"
							priority
						/>
						<h1 className="text-3xl lg:text-2xl xl:text-3xl animate-pulse text-blue-700">
							{total.desktop + total.mobile}
						</h1>
					</div>
				</div>
				<div className="bg-muted/50 aspect-video rounded-xl border">
					<div className="flex h-full flex-col items-center justify-center gap-2 p-4">
						<Image
							src={"/human.svg"}
							alt="human"
							width={1}
							height={1}
							className="w-18 h-18 lg:w-11 lg:h-11 xl:w-16 xl:h-16"
							priority
						/>
						<h1 className="text-3xl lg:text-2xl xl:text-3xl animate-pulse text-green-700">
							{humans.desktop + humans.mobile}
						</h1>
					</div>
				</div>
				<div className="bg-muted/50 aspect-video rounded-xl border">
					<div className="flex h-full flex-col items-center justify-center gap-2 p-4">
						<Image
							src={"/robot.svg"}
							alt="robot"
							width={1}
							height={1}
							className="w-18 h-18 lg:w-11 lg:h-11 xl:w-16 xl:h-16"
							priority
						/>
						<h1 className="text-3xl lg:text-2xl xl:text-3xl animate-pulse text-yellow-600">
							{bots.desktop + bots.mobile}
						</h1>
					</div>
				</div>
				<div className="bg-muted/50 aspect-video rounded-xl border">
					<div className="flex h-full flex-col items-center justify-center gap-2 p-4">
						<Image
							src={"/blocked.svg"}
							alt="blocked"
							width={1}
							height={1}
							className="w-18 h-18 lg:w-11 lg:h-11 xl:w-16 xl:h-16 fill-red-700"
							priority
						/>
						<h1 className="text-3xl lg:text-2xl xl:text-3xl animate-pulse text-red-700">
							{blocked.desktop + blocked.mobile}
						</h1>
					</div>
				</div>
			</div>
			<ChartData
				user={user}
				activeChart={activeChart}
				loading={loading}
				total={total}
				selectedKey={selectedKey}
				chartData={chartData}
				shortlinks={shortlinks}
				setSelectedKey={setSelectedKey}
				clearOpen={clearOpen}
				setClearOpen={setClearOpen}
				clearing={clearing}
				handleClearLogs={handleClearLogs}
				setActiveChart={setActiveChart}
			/>
		</div>
	);
}
