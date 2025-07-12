"use client";

import { tmdb } from "@/hooks/useTmdb";

import Header from "@/components/Header";
import Carousel from "@/sections/Carousel";
import GenreList from "@/sections/GenreList";
import List from "@/sections/List";

import { Flame, Clapperboard, Sparkles } from "lucide-react";

export default function Filmy() {
  return (
    <div className="page-filmy">
      <Header active="filmy" />
      <main className="main-container section-spacing">
        <Carousel useFetch={tmdb.movie.Trending} type='movie' />
        <GenreList type='filmy' useFetch={tmdb.genre.Movie} />
        <List header="Populární" icon={<Flame size={30} />} type='movie' fetchFunction={(params) => tmdb.get("/movie/popular", params)} />
        <List header="Nejlépe hodnocené" icon={<Sparkles size={30} />} type='movie' fetchFunction={(params) => tmdb.get("/movie/top_rated", params)} />
        <List header="Nadcházející" icon={<Clapperboard size={30} />} type='movie' fetchFunction={(params) => tmdb.get("/movie/upcoming", params)} />
      </main>
    </ div>
  );
}