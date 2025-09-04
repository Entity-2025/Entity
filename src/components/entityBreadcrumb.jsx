"use client";
import { useRouter } from "next/navigation";
import {
	Breadcrumb,
	BreadcrumbList,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export default function EntityBreadcrumb({ items }) {
	const router = useRouter();

	const goTo = (href) => {
		if (href) router.push(href);
	};

	return (
		<div className="p-5 hidden sm:flex">
			<Breadcrumb>
				<BreadcrumbList>
					{items.map((item, idx) => (
						<span key={"bc-" + idx} className="flex items-center">
							<BreadcrumbItem>
								<BreadcrumbLink asChild>
									<p
										onClick={item.href ? () => goTo(item.href) : undefined}
										className={`cursor-pointer text-xs sm:text-sm ${
											item.active ? "font-semibold text-red-800" : ""
										}`}
									>
										{item.label}
									</p>
								</BreadcrumbLink>
							</BreadcrumbItem>
							{idx < items.length - 1 && <BreadcrumbSeparator />}
						</span>
					))}
				</BreadcrumbList>
			</Breadcrumb>
		</div>
	);
}
