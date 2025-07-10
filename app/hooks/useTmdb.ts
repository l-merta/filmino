import { useState, useEffect } from "react";
import { tmdbGet } from "@/lib/apiClient";
import { GenreList, MediaList, Params, TmdbHookReturn } from "@/types/tmdbApi";

function useTmdbQuery<T>(endpoint: string, params: Params = {}): TmdbHookReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  // Serialize params to create a stable dependency
  const paramsString = JSON.stringify(params);

  const refetch = () => {
    setRefetchTrigger(prev => prev + 1);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const result = await tmdbGet<T>(endpoint, params);
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('An error occurred'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint, paramsString, refetchTrigger]);

  return { data, isLoading, error, refetch };
}

// Movie list endpoints
export const tmdbMovie = {
  NowPlaying: (config: Params = {}) => {
    const { page = 1, ...params } = config;
    return useTmdbQuery<MediaList>("/movie/now_playing", { page, ...params });
  },
  Popular: (config: Params = {}) => {
    const { page = 1, ...params } = config;
    return useTmdbQuery<MediaList>("/movie/popular", { page, ...params });
  },
  TopRated: (config: Params = {}) => {
    const { page = 1, ...params } = config;
    return useTmdbQuery<MediaList>("/movie/top_rated", { page, ...params });
  },
  Upcoming: (config: Params = {}) => {
    const { page = 1, ...params } = config;
    return useTmdbQuery<MediaList>("/movie/upcoming", { page, ...params });
  },
  Trending: (config: Params = {}) => {
    const { page = 1, ...params } = config;
    return useTmdbQuery<MediaList>("/trending/movie/day", { page, ...params });
  },
};

// TV list endpoints
export const tmdbTv = {
  Popular: (config: Params = {}) => {
    const { page = 1, ...params } = config;
    return useTmdbQuery<MediaList>("/tv/popular", { page, ...params });
  },
  TopRated: (config: Params = {}) => {
    const { page = 1, ...params } = config;
    return useTmdbQuery<MediaList>("/tv/top_rated", { page, ...params });
  },
  OnTheAir: (config: Params = {}) => {
    const { page = 1, ...params } = config;
    return useTmdbQuery<MediaList>("/tv/on_the_air", { page, ...params });
  },
  Trending: (config: Params = {}) => {
    const { page = 1, ...params } = config;
    return useTmdbQuery<MediaList>("/trending/tv/day", { page, ...params });
  },
};

export const tmdbGenre = {
  Movie: (config: Params = {}) => {
    return useTmdbQuery<GenreList>("/genre/movie/list", { ...config });
  },
  Tv: (config: Params = {}) => {
    return useTmdbQuery<GenreList>("/genre/tv/list", {...config});
  },
}

export const tmdbImage = {
  getImage: (path: string) => {
    return `https://image.tmdb.org/t/p/w500/${path}`;
  },
}

export const tmdb = {
  get: tmdbGet,
  movie: tmdbMovie,
  tv: tmdbTv,
  genre: tmdbGenre,
  image: tmdbImage.getImage,
};