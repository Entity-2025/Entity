import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const shortlinkKey = searchParams.get("shortlinkKey");

        const client = await clientPromise;
        const db = client.db("ENTITY");

        const matchStage = shortlinkKey ? { $match: { shortlinkKey } } : {};

        const pipeline = [
            ...(shortlinkKey ? [matchStage] : []),
            {
                $project: {
                    deviceType: {
                        $cond: [
                            { $in: ["$deviceType", ["mobile", "tablet"]] },
                            "mobile",
                            "desktop"
                        ],
                    },
                    isBot: { $ifNull: ["$isBot", false] },
                    isBlocked: { $ifNull: ["$isBlocked", false] }
                }
            },
            {
                $facet: {
                    TOTAL: [
                        { $group: { _id: "$deviceType", count: { $sum: 1 } } }
                    ],
                    HUMANS: [
                        { $match: { isBot: false } },
                        { $group: { _id: "$deviceType", count: { $sum: 1 } } }
                    ],
                    BOTS: [
                        { $match: { isBot: true } },
                        { $group: { _id: "$deviceType", count: { $sum: 1 } } }
                    ],
                    BLOCKED: [
                        { $match: { isBlocked: true } },
                        { $group: { _id: "$deviceType", count: { $sum: 1 } } }
                    ]
                }
            }
        ];

        const aggregation = await db.collection("entity_visitors").aggregate(pipeline).toArray();
        const [data] = aggregation;

        const result = {
            TOTAL: { desktop: 0, mobile: 0 },
            HUMANS: { desktop: 0, mobile: 0 },
            BOTS: { desktop: 0, mobile: 0 },
            BLOCKED: { desktop: 0, mobile: 0 }
        };

        for (const [type, counts] of Object.entries(data)) {
            counts.forEach(({ _id, count }) => {
                if (result[type]) {
                    result[type][_id] = count;
                }
            });
        }

        const chartData = Object.entries(result)
            .filter(([info]) => info !== "TOTAL")
            .map(([info, values]) => ({
                info,
                ...values
            }));

        return NextResponse.json({
            total: result.TOTAL,
            chartData
        });
    } catch (error) {
        console.error("Error in /api/visitors/stats:", error);
        return NextResponse.json(
            { error: "Failed to get visitor stats" },
            { status: 500 }
        );
    }
}
