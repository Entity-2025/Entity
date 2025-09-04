"use client";

import { useEffect, useState } from "react";
import EntityManageShortlinksContent from "@/components/shortlinks/entityManageShortlinksContent";
import { ManageShortlinkSkeleton } from "@/components/loading/entitySkeleton";
import { useRouter } from "next/navigation";
import {
	EntityNoShortlinksYet,
	EntityManageShortlinks,
} from "@/components/title/EntityTitle";
import EntityButtonLoading from "@/components/loading/entityButtonLoading";

export default function ManageShortlinksTab({ user }) {
	const [shortlinks, setShortlinks] = useState([]);
	const [loading, setLoading] = useState(true);
	const [editOpen, setEditOpen] = useState(false);
	const [editData, setEditData] = useState(null);
	const [message, setMessage] = useState("");
	const [deleteOpen, setDeleteOpen] = useState(false);
	const [deleteData, setDeleteData] = useState(null);
	const [skeletonCount, setSkeletonCount] = useState(4);
	const router = useRouter();

	const fetchShortlinks = () => {
		if (!user) return;
		setLoading(true);
		fetch(`/api/shortlinks/list?owner=${encodeURIComponent(user)}`)
			.then((res) => res.json())
			.then((data) => {
				if (data.shortlinks) {
					setSkeletonCount(data.shortlinks.length || 4);
				}
				setTimeout(() => {
					setShortlinks(data.shortlinks || []);
					setLoading(false);
				}, 1000);
			})
			.catch(() => setLoading(false));
	};

	useEffect(() => {
		fetchShortlinks();
	}, [user]);

	const createShortlink = () => {
		router.push("/dashboard?tab=create_shortlinks");
	};

	const [autoUpdating, setAutoUpdating] = useState(false);

	useEffect(() => {
		fetchShortlinks();

		if (!user) return;

		const interval = setInterval(() => {
			setAutoUpdating(true);

			fetch("/api/shortlinks/check/auto", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ owner: user }),
			})
				.then((res) => res.json())
				.then((data) => {
					if (data.shortlinks) {
						setShortlinks(data.shortlinks);
					}
				})
				.finally(() => setAutoUpdating(false));
		}, 2 * 60 * 1000);

		return () => clearInterval(interval);
	}, [user]);

	return (
		<div className="p-4">
			{loading ? (
				<ManageShortlinkSkeleton count={skeletonCount} />
			) : shortlinks.length === 0 ? (
				<div className="flex flex-col gap-1 items-center justify-center text-center min-h-[70vh] text-muted-foreground">
					<EntityNoShortlinksYet className="w-42 h-5 sm:w-62 sm:h-7" />
					<p className={"ml-7 sm:ml-13 sm:text-base text-sm"}>
						Create your first shorlink{" "}
						<span
							onClick={createShortlink}
							className="cursor-pointer relative font-bold text-red-800 after:content-[''] after:absolute after:left-0 after:-bottom-1 after:w-0 after:h-[1.5px] after:bg-red-800 after:transition-all after:duration-300 hover:after:w-full"
						>
							Here
						</span>
					</p>
				</div>
			) : (
				<div className="grid gap-4">
					<div className={"mb-6 -mt-2"}>
						<EntityManageShortlinks className="w-42 h-5 sm:h-7" />
					</div>
					{shortlinks.map((link) => (
						<div
							key={link.shortlinkKey}
							className="rounded-2xl border border-white dark:border-neutral-900 bg-white dark:bg-neutral-900
                            shadow-md hover:shadow-xl transition-all duration-300 p-4 backdrop-blur"
						>
							<div className="flex flex-col mb-5 border-b pb-4">
								<h1 className="text-zinc-800 dark:text-zinc-100 truncate overflow-hidden whitespace-nowrap max-w-[250px] lg:max-w-xl inline-block">
									Main URL :{" "}
									<span
										className={`font-semibold ${
											link.firstUrlStatus === "live"
												? "text-green-700"
												: link.firstUrlStatus === "rf"
												? "text-red-700"
												: link.firstUrlStatus === "dead"
												? "text-yellow-700"
												: ""
										}`}
									>
										{link.firstUrl}
									</span>
								</h1>
								<h1 className="text-zinc-800 dark:text-zinc-100 truncate overflow-hidden whitespace-nowrap max-w-[250px] lg:max-w-xl inline-block">
									Backup URL :{" "}
									<span
										className={`${
											link.secondUrl === ""
												? "text-red-800 font-semibold"
												: "text-green-700 font-semibold"
										} ${
											link.secondUrlStatus === "live"
												? "text-green-700"
												: link.secondUrlStatus === "rf"
												? "text-red-700"
												: link.secondUrlStatus === "dead"
												? "text-yellow-700"
												: ""
										}`}
									>
										{link.secondUrl === "" ? "Not set" : link.secondUrl}
									</span>
								</h1>
								<h1 className="text-zinc-800 dark:text-zinc-100 truncate overflow-hidden whitespace-nowrap max-w-[250px] lg:max-w-xl inline-block">
									Active URL :{" "}
									<span
										className={`${
											link.activeUrl === "need update"
												? "text-red-700 font-semibold uppercase"
												: "text-blue-700 font-semibold"
										}`}
									>
										{link.activeUrl === "" ? "Not set" : link.activeUrl}
									</span>
								</h1>
							</div>

							<div className="grid grid-cols-1 lg:grid-cols-6 gap-2 text-sm">
								<div>
									<p className="text-xs uppercase">Created at</p>
									<p className="text-green-700 font-semibold mt-0 md:mt-1">
										{link.createdAt
											? new Date(link.createdAt).toLocaleString()
											: "-"}
									</p>
								</div>
								<div>
									<p className="text-xs uppercase">Updated at</p>
									<p
										className={`mt-0 md:mt-1 ${
											link.updatedAt
												? "text-blue-700 font-semibold"
												: "text-red-700 font-semibold"
										}`}
									>
										{link.updatedAt
											? new Date(link.updatedAt).toLocaleString()
											: "-"}
									</p>
								</div>
								<div>
									<p className="text-xs uppercase">Shortlink Key</p>
									<p className="text-cyan-500 font-semibold mt-0 md:mt-1">
										{link.shortlinkKey}
									</p>
								</div>
								<div>
									<p className="text-xs uppercase">Main URL Status</p>
									<p
										className={`px-2 w-max mt-1 rounded bg-white dark:bg-black/30 ${
											link.firstUrlStatus === "live"
												? "text-green-700 ring-1"
												: link.firstUrlStatus === "rf"
												? "text-red-700 ring-1"
												: link.firstUrlStatus === "dead"
												? "text-yellow-700 ring-1"
												: ""
										} font-semibold flex items-center gap-1`}
									>
										{autoUpdating ? (
											<EntityButtonLoading
												className={"invert dark:invert-0 w-4 h-5"}
											/>
										) : (
											link.firstUrlStatus?.toUpperCase() ?? "ACAN"
										)}
									</p>
								</div>
								<div>
									<p className="text-xs uppercase">Backup URL Status</p>
									<p
										className={`px-2 w-max mt-1 rounded bg-white dark:bg-black/30 ${
											link.secondUrlStatus === "live"
												? "text-green-700 ring-1"
												: link.secondUrlStatus === "rf"
												? "text-red-700 ring-1"
												: link.secondUrlStatus === "dead"
												? "text-yellow-700 ring-1"
												: ""
										} font-semibold flex items-center gap-1`}
									>
										{autoUpdating ? (
											<EntityButtonLoading
												className={"invert dark:invert-0 w-4 h-5"}
											/>
										) : (
											link.secondUrlStatus?.toUpperCase() ?? "ACAN"
										)}
									</p>
								</div>

								<EntityManageShortlinksContent
									editOpen={editOpen}
									setEditOpen={setEditOpen}
									editData={editData}
									setEditData={setEditData}
									deleteData={deleteData}
									setDeleteData={setDeleteData}
									deleteOpen={deleteOpen}
									setDeleteOpen={setDeleteOpen}
									link={link}
									loading={loading}
									setLoading={setLoading}
									user={user}
									fetchShortlinks={fetchShortlinks}
									message={message}
									setMessage={setMessage}
								/>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
