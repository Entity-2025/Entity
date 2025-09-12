"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EntityChangelogs } from "@/components/title/EntityTitle";

// Type -> color mapping
const typeColor = {
	added: "bg-green-100 text-green-700",
	fixed: "bg-yellow-100 text-yellow-700",
	improved: "bg-blue-100 text-blue-700",
	security: "bg-red-100 text-red-700",
};

// Changelog data
const modules = [
	{
		id: "ua-headers",
		title: "UA Headers Check",
		changelogs: [
			{
				date: "2025-09-10",
				title: "Improved Bot Detection Logic",
				type: "improved",
				description:
					"Introduced additional headers like `x-visitor-*` to enrich bot signal detection.",
			},
			{
				date: "2025-09-01",
				title: "Security: Weighted Heuristics",
				type: "security",
				description:
					"Each suspicious header attribute now contributes a weighted score. Risk categories defined as low, medium, high.",
			},
		],
	},
	{
		id: "geoip",
		title: "GeoIP & ASN",
		changelogs: [
			{
				date: "2025-08-28",
				title: "Country & ASN Blocking",
				type: "added",
				description:
					"Blocked datacenter IPs from specific ASN patterns (Google, AWS, OVH) and unsupported countries.",
			},
		],
	},
	{
		id: "language-tags",
		title: "Language Tag Validator",
		changelogs: [
			{
				date: "2025-08-15",
				title: "Strict BCP47 Language Subtag Parsing",
				type: "added",
				description:
					"Validates incoming Accept-Language headers against official IANA subtag registry using `https://www.iana.org/...`.",
			},
		],
	},
	{
		id: "cidr-blocker",
		title: "CIDR IP Blocking",
		changelogs: [
			{
				date: "2025-08-05",
				title: "Dynamic CIDR List Watching",
				type: "improved",
				description:
					"CIDR IP lists are now live-reloaded using `fs.watch`, eliminating the need to restart the service after updates.",
			},
		],
	},
	{
		id: "url-safety",
		title: "URL Safety Checks",
		changelogs: [
			{
				date: "2025-07-28",
				title: "Safe Browsing Integration",
				type: "added",
				description:
					"Implemented Google Safe Browsing checks to validate shortlink targets.",
			},
		],
	},
];

export default function ChangelogsTab() {
	return (
		<div className="p-4">
			<div className="mb-10 -mt-2">
				<EntityChangelogs className="w-42 h-5 sm:h-7" />
			</div>

			{modules.map((module) => (
				<Card key={module.id} className="mb-6 border border-gray-200 shadow-sm">
					<CardHeader className="border-b">
						<CardTitle className="text-lg font-semibold text-gray-800">
							{module.title}
						</CardTitle>
					</CardHeader>

					<CardContent className="space-y-6 pt-6">
						{module.changelogs && module.changelogs.length > 0 ? (
							module.changelogs.map((log, index) => (
								<div key={index} className="space-y-1">
									<div className="flex items-center justify-between">
										<h3 className="text-base font-medium text-gray-900">
											{log.title}
										</h3>
										<Badge
											className={`text-xs capitalize ${typeColor[log.type]}`}
										>
											{log.type}
										</Badge>
									</div>
									<p className="text-sm text-muted-foreground">{log.date}</p>
									<p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
										{log.description}
									</p>
								</div>
							))
						) : (
							<p className="text-sm text-muted-foreground">
								No changelogs available.
							</p>
						)}
					</CardContent>
				</Card>
			))}
		</div>
	);
}
