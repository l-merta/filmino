"use client";

import { useState, useEffect } from "react";
import { apiClient, tmdbGet } from "@/lib/apiClient";
import { CollectionDetails, GenreList, LinkVariables, MediaDetails, MediaImages, MediaList, Params, PersonDetails, SeasonDetails, TmdbHookReturn } from "@/types/tmdbApi";

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
        
        let result: T;
        if (endpoint === "/links") {
          // Use direct API call for links endpoint
          const { data: apiData } = await apiClient.get<T>(endpoint, { params });
          result = apiData;
        } else {
          // Use TMDB proxy for other endpoints
          result = await tmdbGet<T>(endpoint, params);
        }
        
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

export { useTmdbQuery };

// Movie list endpoints
export const tmdbMovie = {
  Details: (id: number, config: Params = {}) => {
    return useTmdbQuery<MediaDetails>(`/movie/${id}`, { ...config });
  },
  Images: (id: number, config: Params = {}) => {
    return useTmdbQuery<MediaImages>(`/movie/${id}/images`, { ...config });
  },
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
  Details: (id: number, config: Params = {}) => {
    return useTmdbQuery<MediaDetails>(`/tv/${id}`, { ...config });
  },
  Season: (id: number, seasonId: number, config: Params = {}) => {
    return useTmdbQuery<SeasonDetails>(`/tv/${id}/season/${seasonId}`, { ...config });
  },
  Images: (id: number, config: Params = {}) => {
    return useTmdbQuery<MediaImages>(`/tv/${id}/images`, { ...config });
  },
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

export const tmdbCollection = {
  Details: (id: number) => {
    const { data, isLoading, error, refetch } = useTmdbQuery<CollectionDetails>(`/collection/${id}`);
    const collectionData = data || null;

    return {
      data: collectionData,
      isLoading,
      error,
      refetch
    };
  },
}

export const tmdbActor = {
  Details: (id: number) => {
    const { data, isLoading, error, refetch } = useTmdbQuery<PersonDetails>(`/person/${id}`);
    const actorData = data || null;

    return {
      data: actorData,
      isLoading,
      error,
      refetch
    };
  },
}

export const tmdbGenre = {
  Movie: (config: Params = {}) => {
    return useTmdbQuery<GenreList>("/genre/movie/list", { ...config });
  },
  Tv: (config: Params = {}) => {
    return useTmdbQuery<GenreList>("/genre/tv/list", {...config});
  },
  Details: (id: number, type: 'tv' | 'movie') => {
    const { data, isLoading, error, refetch } = useTmdbQuery<GenreList>(`/genre/${type}/list`);
    
    const genreData = data?.genres?.find(genre => genre.id === id) || null;
    
    return {
      data: genreData,
      isLoading,
      error,
      refetch
    };
  },
};

export const tmdbImage = {
  getImage: (path: string) => {
    return `https://image.tmdb.org/t/p/original/${path}`;
  },
}

export const tmdbLinks = {
  getLinks: async (type: "movie" | "tv", linkType: string, variables: LinkVariables) => {
    const { data } = await apiClient.get<{ results: { domain: string; url: string }[] }>(
      "/links",
      {
        params: { type, linkType, ...variables },
      }
    );
    return data.results;
  },
  useLinks: (type: "movie" | "tv", linkType: string, variables: LinkVariables) => {
    // Create endpoint path for the hook
    const endpoint = "/links";
    const params = { type, linkType, ...variables };
    
    return useTmdbQuery<{ results: { domain: string; favicon: string; url: string }[] }>(endpoint, params);
  },
};

export const tmdb = {
  get: tmdbGet,
  movie: tmdbMovie,
  tv: tmdbTv,
  actor: tmdbActor,
  collection: tmdbCollection,
  links: tmdbLinks.getLinks,
  useLinks: tmdbLinks.useLinks,
  genre: tmdbGenre,
  image: tmdbImage.getImage,
};