import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import bcrypt from "bcrypt";

export async function POST(req) {
    try {
        const { username, password, confirmPassword, captcha, subscriptionType = "free" } = await req.json();

        const captchaVerify = await fetch("https://www.google.com/recaptcha/api/siteverify", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                secret: process.env.RECAPTCHA_SECRET_KEY,
                response: captcha,
            }),
        });

        const captchaData = await captchaVerify.json();
        if (!captchaData.success) {
            return NextResponse.json(
                { success: false, message: "Captcha verification failed!", field: "captcha" },
                { status: 400 }
            );
        }

        if (!username || !password) {
            return NextResponse.json(
                { success: false, message: "Username and password are required!", field: "credentials" },
                { status: 400 }
            );
        }

        if (username.length < 5) {
            return NextResponse.json(
                { success: false, message: "Username must be at least 5 characters long!", field: "username" },
                { status: 400 }
            );
        }

        if (password.length < 6) {
            return NextResponse.json(
                { success: false, message: "Password must be at least 6 characters long!", field: "password" },
                { status: 400 }
            );
        }

        if (password !== confirmPassword) {
            return NextResponse.json(
                { success: false, message: "Passwords do not match!", field: "confirmPassword" },
                { status: 400 }
            );
        }

        const client = await clientPromise;
        const db = client.db("ENTITY");
        const users = db.collection("entity_users");

        if (await users.findOne({ username })) {
            return NextResponse.json(
                { success: false, message: "Username already taken!", field: "username" },
                { status: 400 }
            );
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        function entity_apikey() {
            const array = new Uint8Array(24);
            crypto.getRandomValues(array);
            return Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("");
        }

        const subscriptionPlans = {
            free: { durationMs: 1 * 24 * 60 * 60 * 1000 },
            pro: { durationMs: 7 * 24 * 60 * 60 * 1000 },
        };

        const plan = subscriptionPlans[subscriptionType] ? subscriptionType : "free";
        const expiresAt = new Date(Date.now() + subscriptionPlans[plan].durationMs);

        await users.insertOne({
            username,
            password: hashedPassword,
            apikey: entity_apikey(),
            subscriptionType: plan,
            totalShortlinks: 0,
            createdAt: new Date(),
            expiresAt,
        });

        await db.collection("entity_notifications").insertOne({
            username,
            type: "welcome",
            message: "Welcome to Entity! Your account has been created successfully.",
            createdAt: new Date(),
            read: false,
        });

        return NextResponse.json(
            {
                success: true,
                message: "User created!",
                expiresAt,
            },
            { status: 201 }
        );
    } catch (err) {
        console.error("Signup Error:", err);
        return NextResponse.json(
            { success: false, message: "Internal Server Error" },
            { status: 500 }
        );
    }
}
