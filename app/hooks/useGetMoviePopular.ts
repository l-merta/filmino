import { useQuery } from "@tanstack/react-query";
import { tmdbGet } from "@/lib/tmdbClient";
import { MovieList } from "@/types/tmdbApi";

export function useGetMoviePopular() {
  return useQuery({
    queryKey: ["movie"],
    queryFn: () => tmdbGet<MovieList>(`/movie/popular`),
  });
}
