import { FloatingInput } from "@/components/ui/FloatingInput";
import {
	AllowedDeviceSelect,
	AllowedCountrySelect,
	BotRedirectionSelect,
} from "@/components/shortlinks/entityShortlinkSelects";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import EntityBackupUrlHelpDialog from "@/components/dialog/entityBackupUrlHelpDialog";
import EntityButtonLoading from "@/components/loading/entityButtonLoading";
import { EntityCreateShortlink } from "@/components/title/EntityTitle";

export default function CreateShortlinksTab({ user }) {
	const [form, setForm] = useState({
		owner: "",
		firstUrl: "",
		secondUrl: "",
		shortlinkKey: "",
		allowedDevice: "both",
		allowedCountry: "all",
		botRedirection: "400",
	});
	const [message, setMessage] = useState("");
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (user) {
			setForm((prev) => ({ ...prev, owner: user }));
		}
	}, [user]);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setMessage("");
		await toast.promise(
			(async () => {
				const res = await fetch("/api/shortlinks/create", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(form),
				});
				const data = await res.json();
				setLoading(false);
				if (res.ok) {
					const msg = `[SUCCESS] ${data.message}`;
					setMessage(msg);
					setForm((prev) => ({
						...prev,
						firstUrl: "",
						secondUrl: "",
						shortlinkKey: "",
						allowedDevice: "both",
						allowedCountry: "all",
						botRedirection: "400",
					}));
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
						<span>Creating Shortlink...</span>
					</div>
				),
				success: (message) => message,
				error: (err) => err.message || "Error",
			}
		);
	};

	return (
		<div className={"p-4"}>
			<div className={"mb-10 -mt-2"}>
				<EntityCreateShortlink className="w-42 h-5 sm:h-7" />
			</div>
			<div className="flex items-center justify-center">
				<form
					onSubmit={handleSubmit}
					className="grid md:grid-cols-2 lg:grid-cols-3 gap-2 p-4 border rounded-xl bg-muted/50 w-full"
				>
					<FloatingInput
						id="main-url"
						label="Main URL"
						type="url"
						value={form.firstUrl}
						onChange={(e) =>
							setForm((prev) => ({ ...prev, firstUrl: e.target.value }))
						}
						required
					/>
					<div>
						<FloatingInput
							id="backup-url"
							label="Backup URL"
							type="url"
							value={form.secondUrl}
							onChange={(e) =>
								setForm((prev) => ({ ...prev, secondUrl: e.target.value }))
							}
						/>
						<EntityBackupUrlHelpDialog />
					</div>
					<FloatingInput
						id="shortlink-key"
						label="Shortlink Key"
						type="text"
						value={form.shortlinkKey}
						onChange={(e) =>
							setForm((prev) => ({ ...prev, shortlinkKey: e.target.value }))
						}
						required
					/>
					<AllowedDeviceSelect
						value={form.allowedDevice}
						onChange={(value) =>
							setForm((prev) => ({ ...prev, allowedDevice: value }))
						}
					/>
					<AllowedCountrySelect
						value={form.allowedCountry}
						onChange={(value) =>
							setForm((prev) => ({ ...prev, allowedCountry: value }))
						}
					/>
					<BotRedirectionSelect
						value={form.botRedirection}
						onChange={(value) =>
							setForm((prev) => ({ ...prev, botRedirection: value }))
						}
					/>
					<Button
						variant={"default"}
						type="submit"
						className="rounded px-4 py-2 mt-2 flex justify-center"
						disabled={loading}
					>
						{loading ? (
							<EntityButtonLoading
								className={"dark:fill-black fill-white w-6 h-6"}
							/>
						) : (
							"Create Shortlink"
						)}
					</Button>
				</form>
			</div>
		</div>
	);
}
