"use client";
import { useState, useRef, useEffect } from "react";
import { FloatingInput } from "@/components/ui/FloatingInput";
import KarmaWrapper from "@/wrapper/karma";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import ReCAPTCHA from "react-google-recaptcha";
import { AlertCircle } from "lucide-react";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { EntityLogin } from "@/components/title/EntityTitle";
import EntityButtonLoading from "@/components/loading/entityButtonLoading";

export default function LoginPageContents() {
	const [form, setForm] = useState({
		username: "",
		password: "",
	});
	const [error, setError] = useState({ field: "", message: "" });
	const router = useRouter();
	const recaptchaRef = useRef(null);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		const checkSession = async () => {
			try {
				const res = await fetch("/api/users/entity");
				if (res.ok) {
					const data = await res.json();
					if (res.status === 401) {
						router.replace("/login");
						return;
					}
					if (data.user) {
						router.replace("/dashboard");
					}
				}
			} catch (err) {
				console.error("Session check failed:", err);
			}
		};
		checkSession();
	}, [router]);

	const gotoSignUp = () => {
		router.push("/signup");
	};

	const handleSubmit = async (e) => {
		setLoading(true);
		e.preventDefault();
		setError({ field: "", message: "" });

		try {
			const captchaToken = await recaptchaRef.current.executeAsync();
			recaptchaRef.current.reset();

			if (!captchaToken) {
				setError({ field: "captcha", message: "Captcha verification failed" });
				return;
			}

			await toast.promise(
				(async () => {
					const res = await fetch("/api/users/login", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({ ...form, captcha: captchaToken }),
					});

					const data = await res.json();
					setLoading(false);

					if (!res.ok || !data.success) {
						if (data.field)
							setError({ field: data.field, message: data.message });
						throw new Error(data.message || "Login failed");
					}
					router.push("/dashboard");
					return { ...data, status: res.status };
				})(),
				{
					icon: null,
					loading: (
						<div className="flex gap-2">
							<EntityButtonLoading className="invert-0 dark:invert w-5 h-5" />
							<span>Logging in...</span>
						</div>
					),
					success: (data) => `[SUCCESS] ${data.message}`,
					error: (err) => `[ERROR] ${err.message || "Login failed"}`,
				}
			);
		} catch (err) {
			setError({ field: "username", message: err.message });
		}
	};

	return (
		<KarmaWrapper className={"flex-col"}>
			<Card className="w-full max-w-sm">
				<CardHeader>
					<CardTitle>
						<EntityLogin className={"w-42 -mb-5"} />
					</CardTitle>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className="space-y-2">
						<div className="relative">
							<FloatingInput
								label="Username"
								id="username"
								type="text"
								value={form.username}
								onChange={(e) =>
									setForm((prev) => ({ ...prev, username: e.target.value }))
								}
							/>
							{(error.field === "username" ||
								error.field === "credentials") && (
								<TooltipProvider>
									<Tooltip>
										<TooltipTrigger asChild>
											<div className="absolute right-2 top-3 text-red-700 cursor-pointer">
												<AlertCircle size={18} />
											</div>
										</TooltipTrigger>
										<TooltipContent>
											<p>{error.message}</p>
										</TooltipContent>
									</Tooltip>
								</TooltipProvider>
							)}
						</div>

						<div className="relative">
							<FloatingInput
								label="Password"
								id="password"
								type="password"
								value={form.password}
								onChange={(e) =>
									setForm((prev) => ({ ...prev, password: e.target.value }))
								}
							/>
							{(error.field === "password" ||
								error.field === "credentials") && (
								<TooltipProvider>
									<Tooltip>
										<TooltipTrigger asChild>
											<div className="absolute right-2 top-3 text-red-700 cursor-pointer">
												<AlertCircle size={18} />
											</div>
										</TooltipTrigger>
										<TooltipContent>
											<p>{error.message}</p>
										</TooltipContent>
									</Tooltip>
								</TooltipProvider>
							)}
						</div>

						<ReCAPTCHA
							ref={recaptchaRef}
							size="invisible"
							sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
						/>
						{error.field === "captcha" && (
							<p className="text-red-700 text-sm">{error.message}</p>
						)}

						<CardFooter className="flex-col gap-2 px-0">
							<Button type="submit" className="w-full">
								{loading ? (
									<EntityButtonLoading
										className={"dark:fill-black fill-white w-6 h-6"}
									/>
								) : (
									"Login"
								)}
							</Button>
						</CardFooter>
					</form>
				</CardContent>
			</Card>

			<div className="mt-2">
				Doesn't have an account? Sign up{" "}
				<span onClick={gotoSignUp} className="link">
					here
				</span>
			</div>
		</KarmaWrapper>
	);
}
