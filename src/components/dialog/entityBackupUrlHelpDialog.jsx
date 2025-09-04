import {
	AlertDialog,
	AlertDialogTrigger,
	AlertDialogContent,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { ChevronLeft, CircleQuestionMark } from "lucide-react";

export default function EntityBackupUrlHelpDialog() {
	return (
		<div className="relative flex items-center">
			<AlertDialog>
				<AlertDialogTrigger asChild>
					<button
						type="button"
						className="absolute right-2 -top-8 cursor-pointer rounded-full"
					>
						<CircleQuestionMark className="w-4 h-4 fill-white text-black dark:fill-black/10 dark:text-white dark:hover:text-red-800 hover:text-red-800 transition duration-150" />
					</button>
				</AlertDialogTrigger>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>What is Backup URL?</AlertDialogTitle>
					</AlertDialogHeader>
					<AlertDialogDescription>
						The Backup URL is an optional link that will be used if the main URL
						is Read Flagged or Dead. This helps ensure your shortlink always
						works, even if the primary destination is down.
					</AlertDialogDescription>
					<AlertDialogFooter>
						<AlertDialogCancel>
							<ChevronLeft />
						</AlertDialogCancel>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
