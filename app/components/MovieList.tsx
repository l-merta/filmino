"use client";

import { tmdb } from "@/hooks/useTmdb";

export default function MovieList() {
  const { data, isLoading, error } = tmdb.movie.Popular();

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      {data?.results?.map((movie) => (
        <div key={movie.id}>
          <h3>{movie.title}</h3>
          <p>{movie.overview}</p>
        </div>
      ))}
    </div>
  );
}
