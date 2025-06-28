import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/apiClient";
import { MovieList } from "@/types/tmdbApi";

export function useGetMovieNowPlaying(page = 1) {
  return useQuery({
    queryKey: ["movie", "now_playing", page],
    queryFn: () => apiGet<MovieList>("/movie/now_playing", { page }),
  });
}

export function useGetMoviePopular(page = 1) {
  return useQuery({
    queryKey: ["movie", "popular", page],
    queryFn: () => apiGet<MovieList>("/movie/popular", { page }),
  });
}

export function useGetMovieTopRated(page = 1) {
  return useQuery({
    queryKey: ["movie", "top_rated", page],
    queryFn: () => apiGet<MovieList>("/movie/top_rated", { page }),
  });
}

export function useGetMovieUpcoming(page = 1) {
  return useQuery({
    queryKey: ["movie", "upcoming", page],
    queryFn: () => apiGet<MovieList>("/movie/upcoming", { page }),
  });
}