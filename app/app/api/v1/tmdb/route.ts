import { NextRequest, NextResponse } from "next/server";
import { axiosInstance } from "@/lib/axios";
import { MediaDetails } from "@/types/tmdbApi";

// Default parameters that apply to all TMDB requests
const DEFAULT_PARAMS = {
  language: "cs-CZ", //en-US
  include_adult: false,
  include_video: true,
  region: "US",
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Get the TMDB path from the 'path' parameter
    const tmdbPath = searchParams.get("path");
    
    if (!tmdbPath) {
      return NextResponse.json(
        { error: "Missing 'path' parameter" },
        { status: 400 }
      );
    }

    // Extract all other parameters (except 'path')
    const params: Record<string, string> = {};
    let excludedGenres: number[] = [];
    
    searchParams.forEach((value, key) => {
      console.log(`Search param: ${key} = ${value}`);
      if (key !== "path") {
        if (key === "excluded_genres") {
          console.log("Excluded genres in params:", JSON.parse(value));
          // Parse excluded_genres as array of numbers
          try {
            excludedGenres = JSON.parse(value);
          } catch {
            // If parsing fails, try splitting by comma
            excludedGenres = value.split(',').map(id => parseInt(id.trim(), 10)).filter(id => !isNaN(id));
          }
        } else {
          params[key] = value;
        }
      }
    });

    // Merge with default parameters (user params override defaults)
    const finalParams = {
      ...DEFAULT_PARAMS,
      ...params,
    };

    // Make the request to TMDB
    const response = await axiosInstance.get(tmdbPath, {
      params: finalParams,
    });

    let responseData = response.data;

    if (responseData.results) {
      // Filter results if excluded_genres is provided and response has results array
      console.log("Excluded genres:", excludedGenres);
      console.log("Results before genre filtering:", responseData.results.length);
      if (excludedGenres.length > 0 && responseData.results && Array.isArray(responseData.results)) {
        responseData = {
          ...responseData,
          results: responseData.results.filter((item: MediaDetails) => {
            // Check if item has genre_ids and filter out items with excluded genres
            if (item.genre_ids && Array.isArray(item.genre_ids)) {
              return !item.genre_ids.some((genreId: number) => excludedGenres.includes(genreId));
            }
            return true; // Keep items without genre_ids
          })
        };
      }
      console.log("Results after genre filtering:", responseData.results.length);
    }

    return NextResponse.json(responseData);
  } catch (error: unknown) {
    console.error("TMDB API error:", error);
    
    // Handle axios errors
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { status?: number; data?: { status_message?: string } } };
      const status = axiosError.response?.status || 500;
      const message = axiosError.response?.data?.status_message || "Failed to fetch from TMDB";
      
      return NextResponse.json(
        { error: message },
        { status }
      );
    }
    
    // Handle other errors
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
