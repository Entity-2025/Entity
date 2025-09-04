import React from "react";
import { Input } from "@/components/ui/input";

export function FloatingInput({
	id,
	label,
	value,
	onChange,
	type = "text",
	required = false,
	...props
}) {
	return (
		<div className="relative">
			<Input
				id={id}
				type={type}
				value={value}
				onChange={onChange}
				required={required}
				className="peer border rounded px-3 pt-5 pb-2 h-12 placeholder-transparent focus:outline-none focus:border-blue-600 text-green-700 font-semibold carret-black dark:caret-white truncate"
				placeholder=" "
				{...props}
			/>
			<label
				htmlFor={id}
				className={
					"absolute text-sm left-2 top-1/2 -translate-y-1/2 dark:text-white/50 text-black/70 px-1 transition-all duration-200 pointer-events-none " +
					"peer-focus:top-3 peer-focus:text-xs peer-focus:font-normal p-2 mb-2 " +
					(value ? "top-3 text-xs font-normal" : "font-semibold")
				}
			>
				{label}
			</label>
		</div>
	);
}
