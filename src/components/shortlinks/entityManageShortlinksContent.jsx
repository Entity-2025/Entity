import { Button } from "@/components/ui/button";
import {
	AllowedDeviceSelect,
	AllowedCountrySelect,
	BotRedirectionSelect,
} from "@/components/shortlinks/entityShortlinkSelects";
import { FloatingInput } from "@/components/ui/FloatingInput";
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
import { toast } from "sonner";
import {
	CheckIcon,
	ChevronLeft,
	CogIcon,
	InfoIcon,
	TrashIcon,
} from "lucide-react";
import {
	Tooltip,
	TooltipTrigger,
	TooltipContent,
} from "@/components/ui/tooltip";
import EntityButtonLoading from "@/components/loading/entityButtonLoading";

export default function EntityManageShortlinksContent({
	editOpen,
	setEditOpen,
	editData,
	setEditData,
	deleteData,
	setDeleteData,
	deleteOpen,
	setDeleteOpen,
	user,
	link,
	setLoading,
	fetchShortlinks,
	setMessage,
}) {
	const handleDelete = (link) => {
		setDeleteData({ ...link });
		setDeleteOpen(true);
	};

	const handleDeleteConfirm = async () => {
		if (!deleteData) return;

		await toast.promise(
			(async () => {
				const res = await fetch("/api/shortlinks/delete", {
					method: "DELETE",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						shortlinkKey: deleteData.shortlinkKey,
						owner: user,
					}),
				});

				const data = await res.json();

				if (res.ok) {
					const msg = `[SUCCESS] ${data.message}`;
					setDeleteOpen(false);
					setDeleteData(null);
					fetchShortlinks();
					return msg;
				} else {
					const msg = `[ERROR] ${data.message || "Failed to delete shortlink"}`;
					throw new Error(msg);
				}
			})(),
			{
				icon: null,
				loading: (
					<div className="flex gap-2">
						<EntityButtonLoading className="invert-0 dark:invert w-5 h-5" />
						<span>Deleting Shortlink...</span>
					</div>
				),
				success: (message) => message,
				error: (err) => err.message || "Error",
			}
		);
	};

	const handleEdit = (link) => {
		setEditData({ ...link });
		setEditOpen(true);
	};

	const handleEditChange = (field, value) => {
		setEditData((prev) => ({ ...prev, [field]: value }));
	};

	const handleEditSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setMessage("");
		if (!editData) return;

		await toast.promise(
			(async () => {
				const payload = {
					...editData,
					owner: user,
					originalShortlinkKey: link.shortlinkKey,
				};

				const res = await fetch("/api/shortlinks/manage", {
					method: "PUT",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(payload),
				});

				const data = await res.json();
				setLoading(false);

				if (res.ok) {
					const msg = `[SUCCESS] ${data.message}`;
					setEditOpen(false);
					setEditData(null);
					fetchShortlinks();
					return msg;
				} else {
					const msg = `[ERROR] ${data.message || "Error"}`;
					setMessage(msg);
					throw new Error(msg);
				}
			})(),
			{
				icon: null,
				loading: (
					<div className="flex gap-2">
						<EntityButtonLoading className="invert-0 dark:invert w-5 h-5" />
						<span>Updating Shortlink...</span>
					</div>
				),
				success: (message) => message,
				error: (err) => err.message || "Error",
			}
		);
	};

	const handleCheckUrl = async (link) => {
		await toast.promise(
			(async () => {
				const res = await fetch("/api/shortlinks/check", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						shortlinkKey: link.shortlinkKey,
						owner: user,
					}),
				});

				const data = await res.json();
				if (!res.ok) {
					throw new Error(data.message || "Failed to check URLs");
				}

				fetchShortlinks();

				const showStatusToast = (label, status) => {
					switch (status) {
						case "live":
							toast.success(`[LIVE] ${label}`);
							break;
						case "dead":
							toast.warning(`[DEAD] ${label}`);
							break;
						case "rf":
							toast.error(`[RF] ${label}`);
							break;
						default:
							toast.error(`[ERROR] ${label} : Error`);
					}
				};

				showStatusToast(data.firstUrl, data.firstUrlStatus);
				showStatusToast(data.secondUrl, data.secondUrlStatus);

				if (data.activeUrl === "need update") {
					toast.error("[ALERT] NEED UPDATE!");
				} else if (data.activeUrl) {
					toast.info(`[INFO] Active URL → ${data.activeUrl}`);
				} else {
					toast.warning("[ALERT] NEED UPDATE!");
				}
			})(),
			{
				icon: null,
				loading: (
					<div className="flex gap-2">
						<EntityButtonLoading className="invert-0 dark:invert w-5 h-5" />
						<span>Checking URLs...</span>
					</div>
				),
				success: () => "URLs checked!",
				error: (err) => err.message || "Error",
			}
		);
	};

	return (
		<div className="flex items-center lg:justify-end gap-2 mt-5 lg:mt-0">
			<AlertDialog
				open={editOpen && editData?._id === link._id}
				onOpenChange={setEditOpen}
			>
				<AlertDialogTrigger asChild>
					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								size="sm"
								variant="outline"
								onClick={() => handleEdit(link)}
							>
								<CogIcon className="h-4 w-4 text-yellow-600" />
							</Button>
						</TooltipTrigger>
						<TooltipContent>
							<p>Edit Shortlink</p>
						</TooltipContent>
					</Tooltip>
				</AlertDialogTrigger>
				<AlertDialogContent>
					<AlertDialogDescription></AlertDialogDescription>
					<AlertDialogHeader>
						<AlertDialogTitle>Edit Shortlink</AlertDialogTitle>
					</AlertDialogHeader>
					{editData && (
						<form onSubmit={handleEditSubmit} className="space-y-2 mt-2">
							<FloatingInput
								id="edit-main-url"
								label="Main URL"
								type="url"
								value={editData.firstUrl || ""}
								onChange={(e) => handleEditChange("firstUrl", e.target.value)}
								required
							/>
							<FloatingInput
								id="edit-backup-url"
								label="Backup URL"
								type="url"
								value={editData.secondUrl || ""}
								onChange={(e) => handleEditChange("secondUrl", e.target.value)}
							/>
							<FloatingInput
								id="edit-shortlinkkey"
								label="Shortlink Key"
								type="text"
								value={editData.shortlinkKey || ""}
								onChange={(e) =>
									handleEditChange("shortlinkKey", e.target.value)
								}
								required
							/>
							<AllowedDeviceSelect
								value={editData.allowedDevice || "both"}
								onChange={(value) => handleEditChange("allowedDevice", value)}
							/>
							<AllowedCountrySelect
								value={editData.allowedCountry || "all"}
								onChange={(value) => handleEditChange("allowedCountry", value)}
							/>
							<BotRedirectionSelect
								value={editData.botRedirection || "404"}
								onChange={(value) => handleEditChange("botRedirection", value)}
							/>
							<AlertDialogFooter>
								<AlertDialogCancel>
									<ChevronLeft />
								</AlertDialogCancel>
								<AlertDialogAction asChild>
									<Tooltip>
										<TooltipTrigger asChild>
											<Button variant="outline">
												<CheckIcon className="h-4 w-4 text-green-700" />
											</Button>
										</TooltipTrigger>
										<TooltipContent>
											<p>Update Shortlink</p>
										</TooltipContent>
									</Tooltip>
								</AlertDialogAction>
							</AlertDialogFooter>
						</form>
					)}
				</AlertDialogContent>
			</AlertDialog>
			<Tooltip>
				<TooltipTrigger asChild>
					<Button
						size="sm"
						variant="outline"
						onClick={() => handleCheckUrl(link)}
					>
						<InfoIcon className="h-4 w-4 text-blue-700" />
					</Button>
				</TooltipTrigger>
				<TooltipContent>
					<p>Check URL</p>
				</TooltipContent>
			</Tooltip>
			<AlertDialog
				open={deleteOpen && deleteData?._id === link._id}
				onOpenChange={setDeleteOpen}
			>
				<AlertDialogTrigger asChild>
					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								size="sm"
								variant="outline"
								onClick={() => handleDelete(link)}
							>
								<TrashIcon className="h-4 w-4 text-red-700" />
							</Button>
						</TooltipTrigger>
						<TooltipContent>
							<p>Delete Shortlink</p>
						</TooltipContent>
					</Tooltip>
				</AlertDialogTrigger>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>
							<Tooltip>
								<div className="flex w-full gap-2">
									<TooltipTrigger asChild>
										<p className="truncate max-w-[225px] sm:max-w-lg">
											Delete{" "}
											<span className="text-blue-700">{link.activeUrl}</span>
										</p>
									</TooltipTrigger>
									<p>?</p>
								</div>
								<TooltipContent>
									<p>{link.activeUrl}</p>
								</TooltipContent>
							</Tooltip>
						</AlertDialogTitle>
					</AlertDialogHeader>
					<div>
						This will delete the shortlink and all related visitor logs and This
						action cannot be undone. Are you sure you want to delete this
						shortlink?
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
										onClick={handleDeleteConfirm}
									>
										<TrashIcon className="h-4 w-4 text-red-700" />
									</Button>
								</TooltipTrigger>
								<TooltipContent>
									<p>Delete Shortlink</p>
								</TooltipContent>
							</Tooltip>
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
