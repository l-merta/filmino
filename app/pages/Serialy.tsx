"use client";

import { tmdb } from "@/hooks/useTmdb";

import Header from "@/components/Header";
import Carousel from "@/sections/Carousel";
import GenreList from "@/sections/GenreList";
import List from "@/sections/List";

import { Flame, Sparkles, Clapperboard } from "lucide-react";

export default function Serialy() {
  return (
    <div className="page-serialy">
    <Header active="serialy" />
    <main className="main-container section-spacing">
      <Carousel useFetch={tmdb.tv.Trending} type='tv' />
      <GenreList type='serialy' useFetch={tmdb.genre.Tv} />
      <List header="Populární" icon={<Flame size={30} />} type='tv' fetchFunction={(params) => tmdb.get("/discover/tv", { ...params, "vote_count.gte": 100})} />
      <List header="Aktuální" icon={<Sparkles size={30} />} type='tv' fetchFunction={(params) => tmdb.get("/tv/top_rated", params)} />
      <List header="Nadcházející" icon={<Clapperboard size={30} />} type='tv' fetchFunction={(params) => tmdb.get("/tv/top_rated", params)} />
    </main>
    </div>
  );
}