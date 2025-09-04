import { NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import clientPromise from "@/lib/mongodb";
import { sessionOptions } from "@/lib/entitySession";

export async function POST(req, { params }) {
    try {
        const res = NextResponse.next();
        const session = await getIronSession(req, res, sessionOptions);

        if (!session.user) {
            return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });
        }

        const owner = session.user.username;
        const shortlinkKey = params.key;

        if (!shortlinkKey) {
            return NextResponse.json({ success: false, message: "Missing shortlink key" }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db("ENTITY");

        const result = await db.collection("entity_visitors").deleteMany({
            owner,
            shortlinkKey,
        });

        return NextResponse.json({
            success: true,
            message: `Deleted ${result.deletedCount} visitor logs for shortlink: ${shortlinkKey}`,
        });
    } catch (error) {
        console.error("Error clearing visitor logs:", error);
        return NextResponse.json({ success: false, message: "Failed to clear logs." }, { status: 500 });
    }
}
