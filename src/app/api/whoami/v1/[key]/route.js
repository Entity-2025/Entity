import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { UAParser } from "ua-parser-js";

import {
    EntityCountry,
    EntityDeviceCheck,
    EntityAsnCheck,
    EntityCidrCheck,
    EntityBotCheck,
    EntityRateLimit,
    EntityIpWhitelistCheck,
    EntityIpBlacklistCheck
} from "@/lib/EntityBlocker";
import { getCountry, getAsn } from "@/lib/EntityGeoIp";

export async function GET(req, context) {
    const params = await context.params;
    const { key } = params;

    const apiKey = req.headers.get("x-entity-api-key");
    const visitorIp = req.headers.get("x-visitor-ip-asli") || "0.0.0.0";
    const userAgent = req.headers.get("x-visitor-user-agent") || "";

    const client = await clientPromise;
    const db = client.db("ENTITY");

    try {
        const allowed = await EntityRateLimit(visitorIp, 5, 60);
        if (!allowed) {
            return NextResponse.json(
                { error: "Too Many Requests - Rate limit exceeded" },
                { status: 429 }
            );
        }

        const user = await db.collection("entity_users").findOne({ apikey: apiKey });
        if (!user) {
            return NextResponse.json({ error: "Invalid API Key" }, { status: 401 });
        }

        const shortlink = await db.collection("entity_shortlinks").findOne({
            shortlinkKey: key,
            owner: user.username,
        });

        if (!shortlink) {
            return NextResponse.json({ error: "Shortlink not found" }, { status: 404 });
        }

        if (user.subscriptionType === "free") {
            return NextResponse.json({ error: "Free accounts cannot use Entity" }, { status: 403 });
        }

        if (shortlink.activeUrl === "need update" || !shortlink.activeUrl) {
            return NextResponse.json({ error: "No active URL available" }, { status: 503 });
        }

        const visitorCountry = await getCountry(visitorIp);
        const visitorAsn = await getAsn(visitorIp);

        const ua = new UAParser(userAgent);
        const deviceType = ua.getDevice().type || "desktop";

        const checks = [
            { fn: () => EntityIpWhitelistCheck(shortlink, visitorIp), reason: "whitelist", async: false },
            { fn: () => EntityIpBlacklistCheck(shortlink, visitorIp), reason: "ipBlacklist", async: false },
            { fn: () => EntityBotCheck(shortlink, visitorIp), reason: "bot", async: true },
            { fn: () => EntityAsnCheck(shortlink, visitorIp, visitorAsn), reason: "asn", async: false },
            { fn: () => EntityCidrCheck(shortlink, visitorIp), reason: "cidr", async: true },
            { fn: () => EntityCountry(shortlink, visitorIp, visitorCountry), reason: "country", async: false },
            { fn: () => EntityDeviceCheck(shortlink, userAgent), reason: "device", async: false },
        ];

        const logBase = {
            shortlinkKey: key,
            owner: user.username,
            visitorIp,
            userAgent,
            visitorCountry,
            visitorAsn,
            deviceType,
            timestamp: new Date(),
        };

        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        const recentLog = await db.collection("entity_visitors").findOne({
            visitorIp,
            shortlinkKey: key,
            timestamp: { $gte: oneHourAgo },
        });

        for (const check of checks) {
            const result = check.async ? await check.fn() : check.fn();
            if (result) {
                if (result?.bypass) {
                    if (!recentLog) {
                        await db.collection("entity_visitors").insertOne({
                            ...logBase,
                            isBot: false,
                            isBlocked: false,
                            blockReason: null,
                            note: "Whitelisted IP",
                        });
                    }
                    return NextResponse.redirect(shortlink.activeUrl, 302);
                }

                if (!recentLog) {
                    await db.collection("entity_visitors").insertOne({
                        ...logBase,
                        isBot: check.reason === "bot",
                        isBlocked: true,
                        blockReason: check.reason,
                    });
                }

                return result instanceof Response
                    ? result
                    : NextResponse.json({ blocked: true, reason: check.reason });
            }
        }

        if (!recentLog) {
            await db.collection("entity_visitors").insertOne({
                ...logBase,
                isBot: false,
                isBlocked: false,
                blockReason: null,
            });
        }

        return NextResponse.redirect(shortlink.activeUrl, 302);
    } catch (err) {
        console.error("Visitor logging failed:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
