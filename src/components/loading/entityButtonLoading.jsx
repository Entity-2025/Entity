import Image from "next/image";

export default function EntityButtonLoading({ className }) {
	return (
		<Image
			className={`dark:invert animate-spin ${className}`}
			src="/entity.svg"
			alt="Entity logo"
			width={22}
			height={22}
			priority
		/>
	);
}
