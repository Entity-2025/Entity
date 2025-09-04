"use client";
import { useState, useRef } from "react";
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
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import ReCAPTCHA from "react-google-recaptcha";
import { EntitySignup } from "@/components/title/EntityTitle";
import EntityButtonLoading from "@/components/loading/entityButtonLoading";

export default function SignUpPageContents() {
	const [loading, setLoading] = useState(false);
	const [form, setForm] = useState({
		username: "",
		password: "",
		confirmPassword: "",
	});
	const [showPassword, setShowPassword] = useState(false);
	const [error, setError] = useState({
		field: "",
		message: "",
	});
	const router = useRouter();

	const gotoLogin = () => {
		router.push("/login");
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
					const res = await fetch("/api/users/create", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({ ...form, captcha: captchaToken }),
					});

					const data = await res.json();
					setLoading(false);

					if (!res.ok || !data.success) {
						if (data.field)
							setError({ field: data.field, message: data.message });
						throw new Error(data.message || "Signup failed");
					}
					router.push("/login");
					return { ...data, status: res.status };
				})(),
				{
					icon: null,
					loading: (
						<div className="flex gap-2">
							<EntityButtonLoading className="invert-0 dark:invert w-5 h-5" />
							<span>Creating your account...</span>
						</div>
					),
					success: (data) => `[SUCCESS] ${data.message}`,
					error: (err) => `[ERROR] ${err.message || "Account creation failed"}`,
				}
			);
		} catch (err) {
			setError({ field: "username", message: err.message });
		}
	};

	const recaptchaRef = useRef(null);

	return (
		<KarmaWrapper className="flex-col">
			<Card className="w-full max-w-sm">
				<CardHeader>
					<CardTitle>
						<EntitySignup className={"w-42 -mb-5"} />
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
											<div className="absolute right-2 top-3 p-1 rounded-full hover:bg-black/10 hover:dark:bg-white/10 text-red-700 cursor-pointer">
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
								type={showPassword ? "text" : "password"}
								value={form.password}
								onChange={(e) =>
									setForm((prev) => ({ ...prev, password: e.target.value }))
								}
							/>

							<TooltipProvider>
								<Tooltip>
									<TooltipTrigger asChild>
										<button
											type="button"
											className="absolute right-2 top-3 p-1 cursor-pointer rounded-full hover:bg-black/10 hover:dark:bg-white/10 transition duration-200"
											onClick={() => setShowPassword((prev) => !prev)}
										>
											{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
										</button>
									</TooltipTrigger>
									<TooltipContent>
										<p>{showPassword ? "Hide Password" : "Show Password"}</p>
									</TooltipContent>
								</Tooltip>
							</TooltipProvider>

							{(error.field === "password" ||
								error.field === "credentials") && (
								<TooltipProvider>
									<Tooltip>
										<TooltipTrigger asChild>
											<div className="absolute right-8 top-3 p-1 rounded-full hover:bg-black/10 hover:dark:bg-white/10 text-red-700 cursor-pointer">
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
								label="Confirm Password"
								id="confirm-password"
								type={showPassword ? "text" : "password"}
								value={form.confirmPassword}
								onChange={(e) =>
									setForm((prev) => ({
										...prev,
										confirmPassword: e.target.value,
									}))
								}
							/>

							{error.field === "confirmPassword" && (
								<TooltipProvider>
									<Tooltip>
										<TooltipTrigger asChild>
											<div className="absolute right-2 top-3 p-1 rounded-full hover:bg-black/10 hover:dark:bg-white/10 text-red-700 cursor-pointer">
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
									"Sign Up"
								)}
							</Button>
						</CardFooter>
					</form>
				</CardContent>
			</Card>

			<div className="mt-2">
				Already have an account? Login{" "}
				<span onClick={gotoLogin} className="link">
					Here
				</span>
			</div>
		</KarmaWrapper>
	);
}
