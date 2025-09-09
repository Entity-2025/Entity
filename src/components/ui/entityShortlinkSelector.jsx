import {
	Select,
	SelectTrigger,
	SelectContent,
	SelectItem,
	SelectValue,
} from "@/components/ui/select";

export function AllowedDeviceSelect({ value, onChange }) {
	return (
		<div>
			<label
				htmlFor="allowed-device"
				className="block text-xs font-semibold mb-1 ml-1 dark:text-white/50 text-black/70"
			>
				Allowed Device
			</label>
			<Select value={value} onValueChange={onChange}>
				<SelectTrigger
					id="allowed-device"
					className="w-full bg-white border-neutral-500"
				>
					<SelectValue placeholder="Select device" />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="desktop">Desktop Only</SelectItem>
					<SelectItem value="mobile">Mobile Only</SelectItem>
					<SelectItem value="both">Allow Both</SelectItem>
				</SelectContent>
			</Select>
		</div>
	);
}

export function AllowedCountrySelect({ value, onChange }) {
	return (
		<div>
			<label
				htmlFor="allowed-country"
				className="block text-xs font-semibold mb-1 ml-1 dark:text-white/50 text-black/70"
			>
				Allowed Country
			</label>
			<Select value={value} onValueChange={onChange}>
				<SelectTrigger
					id="allowed-country"
					className="w-full bg-white border-neutral-500"
				>
					<SelectValue placeholder="Select country" />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="ID">Indonesia</SelectItem>
					<SelectItem value="US">United States</SelectItem>
					<SelectItem value="GB">United Kingdom</SelectItem>
					<SelectItem value="SG">Singapore</SelectItem>
					<SelectItem value="all">Allow All</SelectItem>
				</SelectContent>
			</Select>
		</div>
	);
}

export function BotRedirectionSelect({ value, onChange }) {
	return (
		<div>
			<label
				htmlFor="bot-redirection"
				className="block text-xs font-semibold mb-1 ml-1 dark:text-white/50 text-black/70"
			>
				Bot Redirection
			</label>
			<Select value={value} onValueChange={onChange}>
				<SelectTrigger
					id="bot-redirection"
					className="w-full bg-white border-neutral-500"
				>
					<SelectValue placeholder="Select action" />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="400">400 Bad Request</SelectItem>
					<SelectItem value="401">401 Unauthorized</SelectItem>
					<SelectItem value="403">403 Forbidden</SelectItem>
					<SelectItem value="404">404 Not Found</SelectItem>
					<SelectItem value="500">500 Server Error</SelectItem>
					<SelectItem value="random">Redirect to Random URL</SelectItem>
				</SelectContent>
			</Select>
		</div>
	);
}
