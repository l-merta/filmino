// types/api.ts
export interface MovieDetails {
  id: number;
  title: string;
  overview: string;
  release_date: string;
  poster_path: string;
  backdrop_path: string;
  // Add more if needed
}

export interface MovieList {
  page: number;
  results: MovieDetails[];
  total_pages: number;
  total_results: number;
}
