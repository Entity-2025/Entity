"use client";

import { useEffect, useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import EntityButtonLoading from "@/components/loading/entityButtonLoading";
import { TrashIcon } from "lucide-react";
import { EntityManageBlacklist } from "@/components/title/EntityTitle";

export default function BlacklistedIpsTab({ user }) {
	const [shortlinks, setShortlinks] = useState([]);
	const [loading, setLoading] = useState(false);
	const [selectedKey, setSelectedKey] = useState("");
	const [blacklist, setBlacklist] = useState([]);
	const [inputValue, setInputValue] = useState("");
	const [saving, setSaving] = useState(false);

	const fetchShortlinks = async () => {
		if (!user) return;
		setLoading(true);

		try {
			const res = await fetch(
				`/api/shortlinks/list?owner=${encodeURIComponent(user)}`
			);
			const data = await res.json();

			setShortlinks(data?.shortlinks || []);

			if (data?.shortlinks?.length) {
				const firstKey = data.shortlinks[0].shortlinkKey;
				setSelectedKey(firstKey);
				setBlacklist(data.shortlinks[0].ipBlacklist || []);
			}
		} catch (err) {
			console.error("Failed to fetch shortlinks:", err);
			setShortlinks([]);
		} finally {
			setLoading(false);
		}
	};

	const handleSelectChange = (key) => {
		setSelectedKey(key);
		const found = shortlinks.find((link) => link.shortlinkKey === key);
		setBlacklist(found?.ipBlacklist || []);
	};

	const parseIps = (value) => {
		return value
			.split(/[\n,]+/)
			.map((ip) => ip.trim())
			.filter((ip) => ip.length > 0);
	};

	const saveBlacklist = async (ips) => {
		if (!selectedKey) return;
		setSaving(true);

		try {
			const res = await fetch("/api/shortlinks/manage", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					owner: user,
					shortlinkKey: selectedKey,
					ipBlacklist: ips,
				}),
			});

			const data = await res.json();
			if (!res.ok) {
				throw new Error(data.message || "Failed to update");
			}

			await fetchShortlinks();

			toast.success("[SUCCESS] Blacklist Updated!");
		} catch (err) {
			console.error("Failed to save blacklist:", err);
			toast.error("[ERROR] Failed!");
		} finally {
			setSaving(false);
		}
	};

	const addIps = () => {
		const ips = parseIps(inputValue);
		if (ips.length === 0) return;
		const updated = Array.from(new Set([...blacklist, ...ips]));
		setInputValue("");

		saveBlacklist(updated);
	};

	const removeIp = (ip) => {
		const updated = blacklist.filter((item) => item !== ip);
		saveBlacklist(updated);
	};

	useEffect(() => {
		fetchShortlinks();
	}, [user]);

	useEffect(() => {
		const found = shortlinks.find((link) => link.shortlinkKey === selectedKey);
		if (found) setBlacklist(found.ipBlacklist || []);
	}, [shortlinks, selectedKey]);

	return (
		<div className="grid gap-4 p-4">
			<div className={"mb-6 -mt-2"}>
				<EntityManageBlacklist className="w-42 h-5 sm:h-7" />
			</div>
			<div className="w-full bg-white dark:bg-neutral-900 shadow-lg rounded-2xl p-6 flex flex-col gap-6">
				{shortlinks.length === 0 && !loading ? (
					<div className="text-center text-gray-500 text-sm">
						No shortlinks available
					</div>
				) : (
					<>
						<div className="w-full max-w-max">
							<label className="hidden sm:block text-sm font-medium mb-2">
								Select Shortlink
							</label>
							<label className="block sm:hidden text-sm font-medium mb-2">
								Select Shortlink by Shortlink Key
							</label>
							<Select
								value={selectedKey}
								onValueChange={handleSelectChange}
								disabled={loading}
							>
								<SelectTrigger>
									{loading ? (
										<div className="flex items-center justify-center mx-auto">
											<EntityButtonLoading className="invert dark:invert-0 w-5 h-5" />
										</div>
									) : (
										<SelectValue placeholder="Choose a shortlink" />
									)}
								</SelectTrigger>
								<SelectContent>
									{shortlinks.map((link) => (
										<SelectItem
											key={link.shortlinkKey}
											value={link.shortlinkKey}
										>
											<Tooltip>
												<TooltipTrigger asChild>
													<div className="flex items-center gap-1 max-w-max sm:max-w-[530px] md:max-w-[380px] lg:max-w-max text-base truncate overflow-hidden whitespace-nowrap">
														<span className="text-blue-700 truncate hidden sm:block">
															{link.activeUrl}
														</span>
														<span className="text-green-600 font-bold">
															({link.shortlinkKey})
														</span>
													</div>
												</TooltipTrigger>
												<TooltipContent
													side="top"
													className="max-w-xs break-words"
												>
													{link.activeUrl} ({link.shortlinkKey})
												</TooltipContent>
											</Tooltip>
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div>
							<label className="block text-sm font-medium mb-2">
								Add IPs to Blacklist
							</label>
							<div className="flex flex-col gap-3">
								<Textarea
									placeholder="Enter IPs (newline or comma separated)"
									value={inputValue}
									onChange={(e) => setInputValue(e.target.value)}
									disabled={saving || loading}
									className="resize-none"
								/>
								<Button
									onClick={addIps}
									disabled={saving || loading}
									className="w-full max-w-xs"
								>
									{saving || loading ? (
										<EntityButtonLoading className="invert-0 dark:invert w-5 h-5" />
									) : (
										"ADD"
									)}
								</Button>
							</div>
						</div>

						<div>
							<h3 className="text-sm font-medium mb-3">Blacklisted IPs</h3>
							<div className="flex flex-col gap-2 max-h-[250px] overflow-y-auto pr-1">
								{loading ? (
									<div className="flex px-5">
										<EntityButtonLoading className="invert dark:invert-0 w-5 h-5" />
									</div>
								) : blacklist.length === 0 ? (
									<p className="text-sm text-red-700">NO BLACKLISTED IPs YET</p>
								) : (
									<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
										{blacklist.map((ip) => (
											<div
												key={ip}
												className="flex justify-between items-center border rounded-lg p-2 hover:bg-gray-50 dark:hover:bg-neutral-800 transition"
											>
												<span className="text-sm">{ip}</span>
												<Tooltip>
													<TooltipTrigger asChild>
														<Button
															variant="ghost"
															size="icon"
															onClick={() => removeIp(ip)}
															disabled={saving}
														>
															{saving ? (
																<EntityButtonLoading className="invert dark:invert-0 w-5 h-5" />
															) : (
																<TrashIcon className="w-4 h-4 text-red-600" />
															)}
														</Button>
													</TooltipTrigger>
													<TooltipContent>
														<p>Remove</p>
													</TooltipContent>
												</Tooltip>
											</div>
										))}
									</div>
								)}
							</div>
						</div>
					</>
				)}
			</div>
		</div>
	);
}
