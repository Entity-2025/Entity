import {
	AlertDialog,
	AlertDialogContent,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function EntityEditDialog({ open, onOpenChange, children }) {
	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Edit Shortlink</AlertDialogTitle>
				</AlertDialogHeader>
				{children}
			</AlertDialogContent>
		</AlertDialog>
	);
}
