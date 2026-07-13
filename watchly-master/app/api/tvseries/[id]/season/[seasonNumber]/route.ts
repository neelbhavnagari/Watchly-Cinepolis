import { NextRequest, NextResponse } from "next/server";
import { getSeasonDetails } from "@/services/tmdb-api";

export async function GET(
    req: NextRequest,
    context: { params: Promise<{ id: string, seasonNumber: string }> }
) {
    try {
        const { id, seasonNumber } = await context.params;
        const seriesId = Number(id);
        const sNumber = Number(seasonNumber);

        if (isNaN(seriesId) || isNaN(sNumber)) {
            return NextResponse.json(
                { error: "Invalid Series ID or Season Number" },
                { status: 400 }
            );
        }

        const data = await getSeasonDetails(seriesId, sNumber);
        return NextResponse.json(data);
    } catch (error) {
        console.error("Error fetching season details:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
