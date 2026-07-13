import { NextResponse } from "next/server";
import { getNowPlayingMovies } from "@/services/tmdb-api";

export async function GET() {
    const data = await getNowPlayingMovies();
    return NextResponse.json(data);
}