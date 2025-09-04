"use client";

import { tmdb } from "@/lib/useTmdb";

import Header from "@/components/Header";
import GenreList from "@/sections/GenreList";
import List from "@/sections/MediaList";

import ErrorPage from "./Error";

interface ZanrFilmyProps {
  genreId: number;
}

export default function ZanrFilmy({ genreId }: ZanrFilmyProps) {
  const { data: genreData, error: genreError } = tmdb.genre.Details(genreId, 'movie');

  if (genreError) return <ErrorPage code={404} title="Žánr nenalezen" message="Omlouváme se, ale požadovaný žánr nebyl nalezen." type="movie" />;

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