"use client";

import { tmdb } from "@/hooks/useTmdb";

import Header from "@/components/Header";
import Carousel from "@/components/Carousel";
import List from "@/sections/List";

export default function Filmy() {
  const { data: data_popular } = tmdb.movie.Popular();
  const { data: data_upcoming } = tmdb.movie.Upcoming();

  return (
    <>
    <Header />
    <main className="main-container">
      <Carousel />
      <List header="Populární" data={data_popular} />
      <List header="Nadcházející" data={data_upcoming} />
    </main>
    </>
  );
}