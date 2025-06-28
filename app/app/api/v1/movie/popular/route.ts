import { NextRequest, NextResponse } from "next/server";
import { tmdbGet } from "@/lib/tmdbClient";
import { MovieList } from "@/types/tmdbApi";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page") || "1";
    
    const data = await tmdbGet<MovieList>(`/movie/popular`, {
      page: parseInt(page, 10),
    });
    
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching popular movies:", error);
    return NextResponse.json(
      { error: "Failed to fetch popular movies" },
      { status: 500 }
    );
  }
}
