"use client";

import { tmdb } from "@/hooks/useTmdb";

import Header from "@/components/Header";
import Carousel from "@/components/Carousel";
import List from "@/sections/List";

export default function Filmy() {
  const { data } = tmdb.movie.Popular();
  console.log(data);

  return (
    <>
    <Header />
    <main className="main-container">
      <Carousel />
      <List header="Poslední přidané filmy" />
    </main>
    </>
  );
}