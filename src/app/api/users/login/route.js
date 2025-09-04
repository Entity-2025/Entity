import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import bcrypt from "bcrypt";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/lib/entitySession";
import { ObjectId } from "mongodb";

export async function POST(req) {
    try {
        const { username, password, captcha } = await req.json();

        const captchaVerify = await fetch(
            "https://www.google.com/recaptcha/api/siteverify",
            {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: new URLSearchParams({
                    secret: process.env.RECAPTCHA_SECRET_KEY,
                    response: captcha,
                }),
            }
        );

        const captchaData = await captchaVerify.json();
        if (!captchaData.success) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Captcha verification failed!",
                    field: "captcha",
                },
                { status: 400 }
            );
        }

        if (!username || !password) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Username and password are required!",
                    field: "username",
                },
                { status: 400 }
            );
        }

        const client = await clientPromise;
        const db = client.db("ENTITY");
        const users = db.collection("entity_users");

        const user = await users.findOne({ username });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid username or password!",
                    field: "credentials",
                },
                { status: 400 }
            );
        }

        const res = NextResponse.json({ success: true, message: "Logged in!" });

        const session = await getIronSession(req, res, sessionOptions);
        session.user = {
            id: user._id.toString(),
            username: user.username,
            apikey: user.apikey,
            subscriptionType: user.subscriptionType,
            expiresAt: Date.now() + 60 * 60 * 1000,
        };
        await session.save();

        return res;
    } catch (err) {
        console.error("Login Error:", err);
        return NextResponse.json(
            { success: false, message: "Internal Server Error" },
            { status: 500 }
        );
    }
}
