"use client";

import { tmdb } from "@/lib/useTmdb";

import Header from "@/components/Header";
import GenreList from "@/sections/GenreList";
import List from "@/sections/MediaList";

import ErrorPage from "./Error";

interface ZanrSerialyProps {
  genreId: number;
}

export default function ZanrSerialy({ genreId }: ZanrSerialyProps) {
  const { data: genreData, error: genreError } = tmdb.genre.Details(genreId, 'tv');

  if (genreError) return <ErrorPage code={404} title="Žánr nenalezen" message="Omlouváme se, ale požadovaný žánr nebyl nalezen." type="tv" />;

  return (
    <div className="page-serialy">
      <Header active="serialy" />
      <main className="main-container section-spacing">
        <GenreList type='serialy' active={genreId} useFetch={tmdb.genre.Tv} />
        <List 
          header={genreData ? `${genreData.name}` : ''} 
          type='tv' 
          fetchFunction={(params) => tmdb.get("/discover/tv", { ...params, with_genres: genreId, "vote_count.gte": 200 })} 
          cardCount={20}
        />
      </main>
    </div>
  );
}