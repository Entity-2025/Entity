import clientPromise from "@/lib/mongodb";
import EntityCheckUrlStatus from "@/lib/EntityCheckUrlStatus";

export async function POST(req) {
    try {
        const {
            owner,
            firstUrl,
            secondUrl,
            shortlinkKey,
            allowedDevice,
            allowedCountry,
            botRedirection,
        } = await req.json();

        if (!owner || !shortlinkKey || !firstUrl) {
            return new Response(JSON.stringify({ message: "Missing required fields!" }), { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db("ENTITY");

        const existing = await db.collection("entity_shortlinks").findOne({ owner: owner, shortlinkKey });
        if (existing) {
            return new Response(JSON.stringify({ message: "Shortlink key already exists! Please choose another key." }), { status: 409 });
        }

        const user = await db.collection("entity_users").findOne({ username: owner });
        if (!user) {
            return new Response(JSON.stringify({ message: "User not found!" }), { status: 404 });
        }

        if (user.subscriptionType === "trial" && user.totalShortlinks >= 1) {
            return new Response(
                JSON.stringify({ message: "Trial users can only create 1 shortlink. Please upgrade your subscription." }),
                { status: 403 }
            );
        }

        if (user.subscriptionType === "pro" && user.totalShortlinks >= 3) {
            return new Response(
                JSON.stringify({ message: "Pro users can only create 3 shortlink. Please upgrade your subscription." }),
                { status: 403 }
            );
        }

        const firstUrlStatus = await EntityCheckUrlStatus(firstUrl);
        const secondUrlStatus = secondUrl ? await EntityCheckUrlStatus(secondUrl) : null;
        const activeUrl = firstUrlStatus === "live" ? firstUrl : secondUrlStatus === "live" ? secondUrl : null;

        const result = await db.collection("entity_shortlinks").insertOne({
            owner,
            firstUrl,
            secondUrl,
            shortlinkKey,
            firstUrlStatus,
            secondUrlStatus,
            activeUrl,
            allowedDevice,
            allowedCountry,
            botRedirection,
            createdAt: new Date()
        });

        await db.collection("entity_users").updateOne(
            { username: owner },
            { $inc: { totalShortlinks: 1 } }
        );

        return new Response(JSON.stringify({ message: `Shortlink created!`, id: result.insertedId }), { status: 201 });
    } catch (error) {
        return new Response(JSON.stringify({ message: error.message }), { status: 500 });
    }
}
