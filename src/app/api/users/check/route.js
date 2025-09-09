import { NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/lib/entityUserSessions";

export async function GET(req) {
    const res = NextResponse.next();
    const session = await getIronSession(req, res, sessionOptions);

    if (!session.user) {
        return NextResponse.json(
            { success: false, message: "Not authenticated" },
            { status: 401 }
        );
    }

    if (session.user.expiresAt && Date.now() > session.user.expiresAt) {
        await session.destroy();
        return NextResponse.json(
            { success: false, message: "Session expired, please log in again." },
            { status: 401 }
        );
    }

    return NextResponse.json({ success: true, user: session.user, expiresAt: session.user.expiresAt, });
}
