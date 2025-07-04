"use client";

import { tmdb } from "@/hooks/useTmdb";

import Header from "@/components/Header";
import Carousel from "@/components/Carousel";
import List from "@/sections/List";

import { Flame, Clapperboard, Sparkles } from "lucide-react";

export default function Filmy() {
  return (
    <>
    <Header active="filmy" />
    <main className="main-container">
      <Carousel />
      <List header="Populární" icon={<Flame size={30} />} type='movie' fetchFunction={(params) => tmdb.get("/movie/popular", params)} />
      <List header="Nadcházející" icon={<Clapperboard size={30} />} type='movie' fetchFunction={(params) => tmdb.get("/movie/upcoming", params)} />
      <List header="Trending" icon={<Sparkles size={30} />} type='movie' fetchFunction={(params) => tmdb.get("/trending/movie/day", params)} />
    </main>
    </>
  );
}