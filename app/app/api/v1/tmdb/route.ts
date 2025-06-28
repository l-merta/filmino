import { NextRequest, NextResponse } from "next/server";
import { axiosInstance } from "@/lib/axios";

// Default parameters that apply to all TMDB requests
const DEFAULT_PARAMS = {
  language: "en-US",
  include_adult: true,
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
    searchParams.forEach((value, key) => {
      if (key !== "path") {
        params[key] = value;
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

    return NextResponse.json(response.data);
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
