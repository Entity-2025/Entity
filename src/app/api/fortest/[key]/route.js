import { NextResponse } from "next/server";
import { UAParser } from "ua-parser-js";
import { getCountry, getAsn } from "@/lib/EntityGeoIp";

import {
    EntityCountry,
    EntityDeviceCheck,
    EntityAsnCheck,
    EntityCidrCheck,
    EntityBotCheck,
    EntityRateLimit,
    EntityIpWhitelistCheck,
    EntityIpBlacklistCheck
} from "@/lib/EntityBlockerDummy";

export async function GET(req, context) {
    const params = await context.params;
    const { key } = params;

    const visitorIp = req.headers.get("x-visitor-ip-asli") || "0.0.0.0";
    const userAgent = req.headers.get("x-visitor-user-agent") || "";

    try {
        let visitorCountry = await getCountry(visitorIp);
        let visitorAsn = await getAsn(visitorIp);
        const ua = new UAParser(userAgent);
        const deviceType = ua.getDevice().type || "desktop";

        if (visitorIp === "0.0.0.0" && key === "test") {
            return NextResponse.json({
                entity: {
                    status: 200,
                    success: true,
                    message: "Welcome to the ENTITY API test endpoint."
                },
                itsYou: {
                    ip: req.headers.get('x-forwarded-for') || visitorIp,
                    device: deviceType,
                    country: req.headers.get('x-forwarded-for') === "::1" ? "We can't define country if you running on localhost!" : visitorCountry,
                    asn: req.headers.get('x-forwarded-for') === "::1" ? "I don't even know who you are!" : visitorAsn,
                    isBot: req.headers.get('x-forwarded-for') === "::1" ? "Maybe, you are a ghost?" : false
                }
            }, { status: 200 });
        }

        if (visitorIp === "0.0.0.0") {
            return NextResponse.json({
                status: 404,
                success: false,
                message: "You forgot to input the IP Address",
            }, { status: 404 });;
        }

        const shortlink = {
            shortlinkKey: key,
            activeUrl: "https://example.com",
            allowedDevice: "all",
            ipWhitelist: ["172.235.55.24"],
            ipBlacklist: ["172.235.55.23"],
            allowedCountry: "all",
        };

        const allowed = await EntityRateLimit(visitorIp, 10, 60);
        if (!allowed) {
            return NextResponse.json({
                success: false,
                blocked: true,
                reason: "rate_limit_exceeded",
                visitorIp,
                deviceType,
                visitorCountry,
                visitorAsn,
                status: 429,
                message: "Too Many Requests - Rate limit exceeded",
            }, { status: 429 });
        }

        const checks = [
            { fn: () => EntityIpWhitelistCheck(shortlink, visitorIp), reason: "whitelisted_ip", async: false },
            { fn: () => EntityIpBlacklistCheck(shortlink, visitorIp), reason: "ip_blacklist", async: false },
            { fn: () => EntityDeviceCheck(shortlink, userAgent), reason: "device_not_allowed", async: false },
            { fn: () => EntityCountry(shortlink, visitorIp, visitorCountry), reason: "country_blocked", async: false },
            { fn: () => EntityCidrCheck(shortlink, visitorIp), reason: "cidr_blocked", async: true },
            { fn: () => EntityAsnCheck(shortlink, visitorIp, visitorAsn), reason: "asn_blocked", async: false },
            { fn: () => EntityBotCheck(shortlink, visitorIp, req.headers), reason: "bot_detected", async: true }
        ];

        for (const check of checks) {
            const result = check.async ? await check.fn() : check.fn();
            if (result) {
                const isBypass = result?.bypass || false;

                return NextResponse.json({
                    success: isBypass,
                    blocked: !isBypass,
                    reason: check.reason,
                    visitorIp,
                    deviceType,
                    visitorCountry,
                    visitorAsn,
                    status: isBypass ? 200 : 403,
                    message: isBypass ? "Visitor bypassed the check (whitelisted)." : "Visitor blocked by ENTITY API.",
                }, { status: isBypass ? 200 : 403 });
            }
        }

        return NextResponse.json({
            success: true,
            blocked: false,
            visitorIp,
            deviceType,
            visitorCountry,
            visitorAsn,
            status: 200,
            message: "Visitor passed all ENTITY API checks.",
        }, { status: 200 });

    } catch (err) {
        return NextResponse.json({
            success: false,
            blocked: true,
            reason: "internal_server_error",
            visitorIp,
            deviceType: new UAParser(userAgent).getDevice().type || "desktop",
            visitorCountry: await getCountry(visitorIp),
            visitorAsn: await getAsn(visitorIp),
            status: 500,
            message: err.message || "Internal Server Error",
        }, { status: 500 });
    }
}
