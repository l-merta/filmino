"use client";

import { tmdb } from "@/lib/useTmdb";

import Header from "@/components/Header";
import Carousel from "@/sections/Carousel";
import GenreList from "@/sections/GenreList";
import List from "@/sections/MediaList";

import { Flame, Clapperboard, Sparkles } from "lucide-react";

export default function Filmy() {
  return (
    <div className="page-filmy">
      <Header active="filmy" />
      <main className="main-container section-spacing">
        <GenreList type='filmy' useFetch={tmdb.genre.Movie} />
        <Carousel useFetch={tmdb.movie.Trending} type='movie' />
        <List header="Populární" icon={<Flame size={30} />} type='movie' fetchFunction={(params) => tmdb.get("/discover/movie", { ...params, "vote_count.gte": 100})} />
        {/* <List header="Objevte nové" icon={<Flame size={30} />} type='movie' fetchFunction={(params) => tmdb.get("/discover/movie", { ...params, "vote_count.gte": 200})} /> */}
        <List header="Nejlépe hodnocené" icon={<Sparkles size={30} />} type='movie' fetchFunction={(params) => tmdb.get("/movie/top_rated", params)} />
        <List header="Nadcházející" icon={<Clapperboard size={30} />} type='movie' fetchFunction={(params) => tmdb.get("/movie/upcoming", params)} />
      </main>
    </ div>
  );
}