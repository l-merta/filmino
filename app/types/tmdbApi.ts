export interface Params {
  page?: number;
  include_adult?: boolean;
  language?: string;
  region?: string;
  with_genres?: string;
  sort_by?: string;
  primary_release_date_gte?: string;
  primary_release_date_lte?: string;
  release_date_gte?: string;
  release_date_lte?: string;
  vote_average_gte?: number;
  vote_average_lte?: number;
  vote_count_gte?: number;
  with_runtime_gte?: number;
  with_runtime_lte?: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any; // Allow additional parameters
}

export interface MediaDetails {
  id: number;
  title: string;
  name: string;
  overview: string;
  release_date: string;
  first_air_date: string;
  last_air_date: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  vote_count: number;
  popularity: number;
  genre_ids: number[];
  adult: boolean;
  video: boolean;
  original_language: string;
  original_title: string;
  original_name: string;
}

export interface MediaList {
  page: number;
  results: MediaDetails[];
  total_pages: number;
  total_results: number;
}

export interface GenreList {
  genres: GenreDetails[];
}

export interface GenreDetails {
  id: number;
  name: string;
}

export interface TmdbHookReturn<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}