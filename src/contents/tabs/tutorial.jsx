import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
	Accordion,
	AccordionItem,
	AccordionTrigger,
	AccordionContent,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";

export default function TutorialTab() {
	return (
		<Card>
			<CardContent>
				<Tabs defaultValue="firing-up">
					<TabsList>
						<TabsTrigger value="firing-up" className={"cursor-pointer"}>
							Firing Up Entity
						</TabsTrigger>
						<TabsTrigger value="managing" className={"cursor-pointer"}>
							Managing & Observation
						</TabsTrigger>
						<TabsTrigger value="addon" className={"cursor-pointer"}>
							Add On
						</TabsTrigger>
					</TabsList>

					<TabsContent value="firing-up">
						<Accordion type="single" collapsible>
							<AccordionItem value="download">
								<AccordionTrigger className={"font-bold"}>
									1. Download Entity
								</AccordionTrigger>
								<AccordionContent className="space-y-2">
									<p>
										Find the latest version of Entity in{" "}
										<Badge>Navigation Menu → Documentation</Badge>.
									</p>
									<p className="text-sm text-muted-foreground">
										Make sure to download the correct version to avoid errors
										during installation.
									</p>
								</AccordionContent>
							</AccordionItem>

							<AccordionItem value="upload">
								<AccordionTrigger className={"font-bold"}>
									2. Upload & Extract Files
								</AccordionTrigger>
								<AccordionContent className="space-y-2">
									<p>
										Upload <code>entity.zip</code> to your cPanel and extract
										all files in the root of your domain.
									</p>
									<p className="text-sm text-muted-foreground">
										Extraction is necessary so that all Entity files are
										accessible on your server.
									</p>
								</AccordionContent>
							</AccordionItem>

							<AccordionItem value="config">
								<AccordionTrigger className={"font-bold"}>
									3. Configure API Key
								</AccordionTrigger>
								<AccordionContent className="space-y-2">
									<p>
										Open <code>config.php</code> and paste your API key, your
										apikey can be found at{" "}
										<Badge>Navigation Menu → Your Account → Account Info</Badge>
										.
									</p>
									<p className="text-sm text-muted-foreground">
										This API key is required to connect your domain to Entity.
									</p>
								</AccordionContent>
							</AccordionItem>

							<AccordionItem value="shortlink">
								<AccordionTrigger className={"font-bold"}>
									4. Create Shortlink
								</AccordionTrigger>
								<AccordionContent className="space-y-2">
									<p>
										Navigate to{" "}
										<Badge>
											Navigation Menu → Shortlinks → Create Shortlink
										</Badge>{" "}
										to generate your first shortlink.
									</p>
									<p className="text-sm text-muted-foreground">
										Shortlinks allow visitors to access your site via
										customizeable URL.
									</p>
								</AccordionContent>
							</AccordionItem>

							<AccordionItem value="access">
								<AccordionTrigger className={"font-bold"}>
									5. Access Your Shortlink
								</AccordionTrigger>
								<AccordionContent className="space-y-2">
									<p>
										Visit your site by accessing :{" "}
										<code>yourdomain.com/r/[shortlinkkey]</code>
									</p>
									<p className="text-sm text-muted-foreground">
										Confirm everything is functioning correctly before creating
										additional shortlinks.
									</p>
								</AccordionContent>
							</AccordionItem>
						</Accordion>
					</TabsContent>

					<TabsContent value="managing">
						<Accordion type="single" collapsible>
							<AccordionItem value="stats">
								<AccordionTrigger className={"font-bold"}>
									1. Shortlink Statistics
								</AccordionTrigger>
								<AccordionContent className="space-y-2">
									<p>
										View shortlink statistics via{" "}
										<Badge>
											Navigation Menu → Shortlinks → Shortlink Statistic
										</Badge>
										, or overall statistics via <Badge>ENTITY</Badge> in the
										navigation menu.
									</p>
									<p className="text-sm text-muted-foreground">
										Monitoring statistics helps you understand traffic and
										overall performance.
									</p>
								</AccordionContent>
							</AccordionItem>

							<AccordionItem value="ip">
								<AccordionTrigger className={"font-bold"}>
									2. IP Management
								</AccordionTrigger>
								<AccordionContent className="space-y-2">
									<p>
										Manage IP addresses through{" "}
										<Badge>
											Navigation Menu → IPs Management → Whitelist/Blacklist
										</Badge>
										.
									</p>
									<p className="text-sm text-muted-foreground">
										This feature allows you to control which IPs can access your
										system for security and management purposes.
									</p>
								</AccordionContent>
							</AccordionItem>
						</Accordion>
					</TabsContent>

					<TabsContent value="addon">
						<Accordion type="single" collapsible>
							<AccordionItem value="live-tester">
								<AccordionTrigger className={"font-bold"}>
									Live Tester
								</AccordionTrigger>
								<AccordionContent className="space-y-2">
									<p>
										Access via{" "}
										<Badge>Navigation Menu → Documentation → Live Tester</Badge>{" "}
										to look up specific IPs.
									</p>
									<p className="text-sm text-muted-foreground">
										Note: This feature may show inaccurate information and is
										still under improvement.
									</p>
								</AccordionContent>
							</AccordionItem>
						</Accordion>
					</TabsContent>
				</Tabs>
			</CardContent>
		</Card>
	);
}
