"use client";

import { tmdb } from "@/lib/useTmdb";

import Header from "@/components/Header";
import GenreList from "@/sections/GenreList";
import List from "@/sections/MediaList";

interface ZanrFilmyProps {
  genreId: number;
}

export default function ZanrFilmy({ genreId }: ZanrFilmyProps) {
  const { data: genreData, error: genreError } = tmdb.genre.Details(genreId, 'movie');

  if (genreError) return (
      <div className="page-filmy">
      <Header active="filmy" />
      <main className="main-container section-spacing">
        <div>Error loading genre: {genreError.message}</div>
      </main>
    </div>
  );
  return (
    <div className="page-filmy">
      <Header active="filmy" />
      <main className="main-container section-spacing">
        <GenreList type='filmy' active={genreId} useFetch={tmdb.genre.Movie} />
        <List 
          header={genreData ? `${genreData.name}` : ''} 
          type='movie' 
          fetchFunction={(params) => tmdb.get("/discover/movie", { ...params, with_genres: genreId, "vote_count.gte": 200 })} 
          cardCount={20}
        />
      </main>
    </div>
  );
}