import { NextRequest, NextResponse } from "next/server";

import { getDiscoverMovies } from "@/services/tmdb-api";

export async function GET(req: NextRequest) {

    const searchParams = req.nextUrl.searchParams;

    const data = await getDiscoverMovies({
        page: Number(searchParams.get("page")) || 1,
        genre: searchParams.get("genre") || undefined,
        sortBy: searchParams.get("sortBy") || undefined,
        adult: searchParams.get("adult") === "true",
        from: searchParams.get("from") || undefined,
        to: searchParams.get("to") || undefined,
    });

    return NextResponse.json(data);
}