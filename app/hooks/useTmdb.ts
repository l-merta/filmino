import { useQuery } from "@tanstack/react-query";
import { tmdbGet } from "@/lib/apiClient";
import { MovieList, Params } from "@/types/tmdbApi";

// Movie list endpoints
export const tmdbMovie = {
  NowPlaying: (config: Params = {}) => {
    const { page = 1, ...params } = config;
    return useQuery({
      queryKey: ["movie", "now_playing", page, params],
      queryFn: () => tmdbGet<MovieList>("/movie/now_playing", { page, ...params }),
    });
  },
  Popular: (config: Params = {}) => {
    const { page = 1, ...params } = config;
    return useQuery({
      queryKey: ["movie", "popular", page, params],
      queryFn: () => tmdbGet<MovieList>("/movie/popular", { page, ...params }),
    });
  },
  TopRated: (config: Params = {}) => {
    const { page = 1, ...params } = config;
    return useQuery({
      queryKey: ["movie", "top_rated", page, params],
      queryFn: () => tmdbGet<MovieList>("/movie/top_rated", { page, ...params }),
    });
  },
  Upcoming: (config: Params = {}) => {
    const { page = 1, ...params } = config;
    return useQuery({
      queryKey: ["movie", "upcoming", page, params],
      queryFn: () => tmdbGet<MovieList>("/movie/upcoming", { page, ...params }),
    });
  },
};

// Tv list endpoints
export const tmdbTv = {
  Popular: (config: Params = {}) => {
    const { page = 1, ...params } = config;
    return useQuery({
      queryKey: ["tv", "popular", page, params],
      queryFn: () => tmdbGet<MovieList>("/tv/popular", { page, ...params }),
    });
  },
  TopRated: (config: Params = {}) => {
    const { page = 1, ...params } = config;
    return useQuery({
      queryKey: ["tv", "top_rated", page, params],
      queryFn: () => tmdbGet<MovieList>("/tv/top_rated", { page, ...params }),
    });
  },
  OnTheAir: (config: Params = {}) => {
    const { page = 1, ...params } = config;
    return useQuery({
      queryKey: ["tv", "on_the_air", page, params],
      queryFn: () => tmdbGet<MovieList>("/tv/on_the_air", { page, ...params }),
    });
  },
};

export const tmdb = {
  get: tmdbGet,
  movie: tmdbMovie,
  tv: tmdbTv,
};