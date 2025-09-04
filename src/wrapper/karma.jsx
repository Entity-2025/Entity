export default function KarmaWrapper({ children, className }) {
	return (
		<div
			className={`flex ${className} items-center justify-center min-h-screen px-2`}
		>
			{children}
		</div>
	);
}
