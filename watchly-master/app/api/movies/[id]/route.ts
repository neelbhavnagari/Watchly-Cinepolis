import { NextRequest, NextResponse } from "next/server";
import { getMovieDetails } from "@/services/tmdb-api";

export async function GET(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        // unwrap the promise
        const { id } = await context.params;
        const movieId = Number(id);

        if (!movieId) {
            return NextResponse.json(
                { error: "Invalid or missing movie ID" },
                { status: 400 }
            );
        }

        const data = await getMovieDetails(movieId);
        return NextResponse.json(data);
    } catch (error) {
        console.error("Error fetching movie details:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
