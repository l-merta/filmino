"use client";

import { tmdb } from "@/hooks/useTmdb";

import Header from "@/components/Header";
import Carousel from "@/components/Carousel";
import List from "@/sections/List";

export default function Filmy() {
  return (
    <>
    <Header />
    <main className="main-container">
      <Carousel />
      <List header="Populární" fetchFunction={(params) => tmdb.get("/movie/popular", params)} />
      <List header="Nadcházející" fetchFunction={(params) => tmdb.get("/movie/upcoming", params)} />
    </main>
    </>
  );
}