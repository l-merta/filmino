"use client";

import { tmdb } from "@/hooks/useTmdb";

import Header from "@/components/Header";
import Carousel from "@/components/Carousel";
import GenreList from "@/sections/GenreList";
import List from "@/sections/List";

import { Flame, Clapperboard } from "lucide-react";

export default function Serialy() {
  return (
    <div className="page-serialy">
    <Header active="serialy" />
    <main className="main-container section-spacing">
      <Carousel />
      <GenreList type='serialy' useFetch={tmdb.genre.Tv} />
      <List header="Populární" icon={<Flame size={30} />} type='tv' fetchFunction={(params) => tmdb.get("/tv/popular", params)} />
      <List header="Nadcházející" icon={<Clapperboard size={30} />} type='tv' fetchFunction={(params) => tmdb.get("/tv/on_the_air", params)} />
    </main>
    </div>
  );
}