"use client";

import { tmdb } from "@/hooks/useTmdb";

import Header from "@/components/Header";
import Carousel from "@/components/Carousel";
import GenreList from "@/sections/GenreList";
import List from "@/sections/List";

import { Flame, Clapperboard, Sparkles } from "lucide-react";

export default function Filmy() {
  return (
    <>
    <Header active="filmy" />
    <main className="main-container">
      <Carousel />
      <GenreList useFetch={tmdb.genre.Movie} />
      <List header="Populární" icon={<Flame size={30} />} type='movie' useFetch={tmdb.movie.Popular} />
      <List header="Nadcházející" icon={<Clapperboard size={30} />} type='movie' useFetch={tmdb.movie.Upcoming} />
      <List header="Trending" icon={<Sparkles size={30} />} type='movie' useFetch={tmdb.movie.Trending} />
    </main>
    </>
  );
}