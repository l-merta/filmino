import { apiClient, tmdbGet } from "@/lib/apiClient";
import { GenreList, MediaDetails, MediaImages, Params, SeasonDetails, LinkVariables, TmdbHookReturn, CollectionDetails, PersonDetails } from "@/types/tmdbApi";

async function tmdbQuery<T>(endpoint: string, params: Params = {}): Promise<TmdbHookReturn<T>> {
  try {
    const data = await tmdbGet<T>(endpoint, params);
    return { data, isLoading: false, error: null, refetch: async () => await tmdbQuery(endpoint, params) };
  } catch (err) {
    return {
      data: null,
      isLoading: false,
      error: err instanceof Error ? err : new Error("An error occurred"),
      refetch: async () => await tmdbQuery(endpoint, params),
    };
  }
}

export { tmdbQuery };

// Movie list endpoints
export const tmdbMovie = {
  Details: (id: number, config: Params = {}) => {
    return tmdbQuery<MediaDetails>(`/movie/${id}`, { ...config });
  },
  Images: (id: number, config: Params = {}) => {
    return tmdbQuery<MediaImages>(`/movie/${id}/images`, { ...config });
  },
};

// TV list endpoints
export const tmdbTv = {
  Details: (id: number, config: Params = {}) => {
    return tmdbQuery<MediaDetails>(`/tv/${id}`, { ...config });
  },
  Season: (id: number, seasonId: number, config: Params = {}) => {
    return tmdbQuery<SeasonDetails>(`/tv/${id}/season/${seasonId}`, { ...config });
  },
  Images: (id: number, config: Params = {}) => {
    return tmdbQuery<MediaImages>(`/tv/${id}/images`, { ...config });
  },
};

export const tmdbCollection = {
  Details: (id: number) => {
    return tmdbQuery<CollectionDetails>(`/collection/${id}`);
  },
}

export const tmdbActor = {
  Details: (id: number) => {
    return tmdbQuery<PersonDetails>(`/person/${id}`);
  },
}

export const tmdbGenre = {
  Movie: (config: Params = {}) => {
    return tmdbQuery<GenreList>("/genre/movie/list", { ...config });
  },
  Tv: (config: Params = {}) => {
    return tmdbQuery<GenreList>("/genre/tv/list", {...config});
  },
  Details: async (id: number, type: 'tv' | 'movie') => {
    const { data, isLoading, error, refetch } = await tmdbQuery<GenreList>(`/genre/${type}/list`);
    
    const genreData = data?.genres?.find(genre => genre.id === id) || null;
    
    return {
      data: genreData,
      isLoading,
      error,
      refetch
    };
  },
}

export const tmdbImage = {
  getImage: (path: string) => {
    return `https://image.tmdb.org/t/p/original/${path}`;
  },
}

export const tmdbLinks = {
  getLinks: async (type: "movie" | "tv", linkType: string, variables: LinkVariables) => {
    const { data } = await apiClient.get<{ url: string; type: string }[]>(
      "/links",
      {
        params: { type, linkType, ...variables },
      }
    );
    return data;
  },
};

export const tmdb = {
  get: tmdbGet,
  movie: tmdbMovie,
  tv: tmdbTv,
  collection: tmdbCollection,
  genre: tmdbGenre,
  actor: tmdbActor,
  image: tmdbImage.getImage,
  links: tmdbLinks.getLinks,
};