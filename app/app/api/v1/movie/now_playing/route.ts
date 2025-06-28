import { NextRequest, NextResponse } from "next/server";
import { tmdbGet } from "@/lib/tmdbClient";
import { MovieList } from "@/types/tmdbApi";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page") || "1";
    
    const data = await tmdbGet<MovieList>(`/movie/now_playing`, {
      page: parseInt(page, 10),
    });
    
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching now playing movies:", error);
    return NextResponse.json(
      { error: "Failed to fetch now playing movies" },
      { status: 500 }
    );
  }
}
