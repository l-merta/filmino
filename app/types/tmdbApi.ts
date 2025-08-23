export interface Params {
  page?: number;
  include_adult?: boolean;
  language?: string;
  region?: string;
  with_genres?: string;
  without_genres?: string;
  sort_by?: string;
  primary_release_date_gte?: string;
  primary_release_date_lte?: string;
  release_date_gte?: string;
  release_date_lte?: string;
  vote_average_gte?: number;
  vote_average_lte?: number;
  ["vote_count.gte"]?: number;
  ["vote_count.lte"]?: number;
  with_runtime_gte?: number;
  with_runtime_lte?: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any; // Allow additional parameters
}

export interface MediaList {
  page: number;
  results: MediaDetails[];
  total_pages: number;
  total_results: number;
}
export interface MediaDetails {
  id: number;
  imdb_id: string | null;
  title: string;
  name: string;
  overview: string;
  tagline: string;
  runtime: number | null;
  number_of_seasons: number | null;
  number_of_episodes: number | null;
  release_date: string;
  first_air_date: string;
  last_air_date: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  vote_count: number;
  popularity: number;
  genres: GenreDetails[];
  adult: boolean;
  video: boolean;
  original_language: string;
  original_title: string;
  original_name: string;
  status: string;
}

export interface MediaImages {
  id: number;
  posters: MediaImageDetails[];
  logos: MediaImageDetails[];
  backdrops: MediaImageDetails[];
}
export interface MediaImageDetails {
  file_path: string;
  width: number;
  height: number;
  aspect_ratio: number;
  vote_average: number;
  vote_count: number;
  iso_639_1: string | null,
}

export interface MediaVideos {
  id: number;
  results: MediaVideoDetails[];
}
export interface MediaVideoDetails {
  id: string;
  iso_639_1: string;
  iso_3166_1: string;
  key: string;
  name: string;
  site: string;
  size: number;
  type: "Behind the Scenes" | "Bloopers" | "Clip" | "Featurette" | "Teaser" | "Trailer";
  official: boolean;
  published_at: string;
}

export interface ActorList {
  cast: ActorDetails[];
}
export interface ActorDetails {
  id: number;
  gender: number;
  adult: boolean;
  name: string;
  original_name: string;
  character: string;
  roles: CharacterDetails[];
  popularity: number;
  profile_path: string | null;
}
export interface CharacterDetails {
  credit_id: string;
  character: string;
  episode_count: number;
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