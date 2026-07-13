import { NextResponse } from "next/server";
import { searchApi } from "@/services/tmdb-api";

// Define allowed search types
type SearchType = "movie" | "tv" | "multi";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const query = searchParams.get("query") || "";
        const type = (searchParams.get("type") as SearchType) || "multi";
        const page = Number(searchParams.get("page")) || 1;

        if (!query) {
            return NextResponse.json({ error: "Missing query parameter" }, { status: 400 });
        }

        const data = await searchApi(query, type, page);
        return NextResponse.json(data);
    } catch (error) {
        console.error("Search API error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
