import * as React from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";

export function EntityAvatar({ src, alt, className, ...props }) {
	return (
		<span
			className={cn("inline-block rounded-full overflow-hidden", className)}
			{...props}
		>
			{src ? (
				<Image
					src={src}
					alt={alt}
					className="object-cover w-full h-full rounded-full"
					width={30}
					height={30}
					priority
				/>
			) : (
				<span className="flex items-center justify-center w-full h-full text-gray-400">
					<svg
						className="w-6 h-6"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z"
						/>
					</svg>
				</span>
			)}
		</span>
	);
}
