"use client";

import { tmdb } from "@/hooks/useTmdb";

import Header from "@/components/Header";
import Carousel from "@/components/Carousel";
import List from "@/sections/List";

export default function Serialy() {
  return (
    <div className="page-serialy">
    <Header active="serialy" />
    <main className="main-container">
      <Carousel />
      <List header="Populární" type='tv' fetchFunction={(params) => tmdb.get("/tv/popular", params)} />
      <List header="Nadcházející" type='tv' fetchFunction={(params) => tmdb.get("/tv/on_the_air", params)} />
    </main>
    </div>
  );
}