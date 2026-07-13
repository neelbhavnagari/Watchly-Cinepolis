import { NextRequest, NextResponse } from "next/server";
import { getSeriesDetails } from "@/services/tmdb-api";

export async function GET(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        // unwrap the promise
        const { id } = await context.params;
        const seriesId = Number(id);

        if (!seriesId) {
            return NextResponse.json(
                { error: "Invalid or missing Series ID" },
                { status: 400 }
            );
        }

        const data = await getSeriesDetails(seriesId);
        return NextResponse.json(data);
    } catch (error) {
        console.error("Error fetching series details:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
