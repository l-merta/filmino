import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/apiClient";
import { MovieList } from "@/types/tmdbApi";

export function useGetMoviePopular(page = 1) {
  return useQuery({
    queryKey: ["movies", "popular", page],
    queryFn: () => apiGet<MovieList>("/movies/popular", { page }),
  });
}
