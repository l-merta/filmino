"use client";

import { tmdb } from "@/hooks/useTmdb";

import Header from "@/components/Header";
import List from "@/sections/List";

interface HledatFilmyProps {
  query: string;
}

export default function HledatFilmy({ query }: HledatFilmyProps) {
  const decodedQuery = decodeURIComponent(query);
  
  return (
    <div className="page-filmy">
      <Header active="filmy" />
      <main className="main-container section-spacing">
        <List 
          header={`Hledání '${decodedQuery}'`} 
          type='movie' 
          fetchFunction={(params) => tmdb.get("/movie/search", { ...params, query: decodedQuery })} 
          cardCount={20}
        />
      </main>
    </div>
  );
}