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
  [key: string]: string | number | boolean | undefined; // Allow additional parameters
}

export interface MovieDetails {
  id: number;
  title: string;
  overview: string;
  release_date: string;
  poster_path: string;
  backdrop_path: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  genre_ids: number[];
  adult: boolean;
  video: boolean;
  original_language: string;
  original_title: string;
  // Add more if needed
}

export interface MovieList {
  page: number;
  results: MovieDetails[];
  total_pages: number;
  total_results: number;
}
