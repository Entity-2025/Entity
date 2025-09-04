import { NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/lib/entitySession";

export async function POST(req) {
    const res = NextResponse.json({ success: true, message: "Logged out!" });
    const session = await getIronSession(req, res, sessionOptions);

    await session.destroy();

    return res;
}
