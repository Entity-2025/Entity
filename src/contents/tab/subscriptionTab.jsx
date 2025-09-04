// components/payments/SubscriptionTab.jsx
"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import EntityButtonLoading from "@/components/loading/entityButtonLoading";

export default function SubscriptionTab({ user }) {
	const router = useRouter();
	const [loading, setLoading] = useState(false);

	const handlePayment = async () => {
		if (loading) return;
		setLoading(true);

		const createTransactionAndPay = async () => {
			const res = await fetch("/api/payment/create", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					amount: 150000,
					items: [
						{
							id: "pro-150k",
							price: 150000,
							quantity: 1,
							name: "Pro Subscription - 7 Days",
						},
					],
					customer: {
						first_name: user?.username || "ENTITY",
						email: user?.email || "user@entity.com",
					},
				}),
			});

			const data = await res.json();
			if (!res.ok) throw new Error(data?.error || "Failed to create payment");
			if (!window?.snap) throw new Error("Midtrans Snap not loaded");

			return new Promise((resolve, reject) => {
				window.snap.pay(data.token, {
					onSuccess: async (result) => {
						toast.success("Payment successful!");
						try {
							await fetch("/api/users/upgrade", {
								method: "POST",
								headers: { "Content-Type": "application/json" },
								body: JSON.stringify({ plan: "pro" }),
							});
							router.refresh();
						} finally {
							setLoading(false);
						}
						resolve(result);
					},
					onPending: function (result) {
						setLoading(false);
						toast.info("Payment is pending.");
						resolve(result);
					},
					onError: function (result) {
						setLoading(false);
						if (result.error_code === "INSUFFICIENT_FUNDS") {
							reject(new Error("INSUFFICIENT_FUNDS"));
						} else if (result.error_code === "INVALID_CARD") {
							reject(new Error("INVALID_CARD"));
						} else {
							reject(new Error("PAYMENT_FAILED"));
						}
					},
					onClose: function () {
						setLoading(false);
						reject(new Error("USER_CLOSED_PAYMENT"));
					},
				});
			});
		};

		try {
			await toast.promise(createTransactionAndPay(), {
				icon: null,
				loading: (
					<div className="flex gap-2">
						<EntityButtonLoading className="invert-0 w-5 h-5" />
						<span>Processing payment...</span>
					</div>
				),
				success: () => undefined,
				error: (err) => {
					if (err.message === "USER_CLOSED_PAYMENT")
						return "Payment was cancelled.";
					if (err.message === "INSUFFICIENT_FUNDS")
						return "Insufficient funds. Please check your balance.";
					if (err.message === "INVALID_CARD")
						return "Invalid card. Please verify your card details.";
					if (err.message === "PAYMENT_FAILED")
						return "Payment failed. Please try again.";
					return "There was an error processing your payment. Please try again.";
				},
			});
		} catch {}
	};

	return (
		<div className="max-w-lg mx-auto mt-10 p-6 border rounded-lg shadow-md bg-white dark:bg-neutral-900">
			<h1 className="text-2xl font-bold mb-2">Pro Subscription</h1>
			<p className="text-muted-foreground mb-4">
				Upgrade to <strong>Pro</strong> and unlock 7 days of full access.
			</p>

			<div className="text-lg font-semibold mb-6">Rp150.000</div>

			<Button onClick={handlePayment} disabled={loading} className="w-full">
				{loading ? (
					<EntityButtonLoading className="invert-0 w-5 h-5" />
				) : (
					"Subscribe Now"
				)}
			</Button>
		</div>
	);
}
