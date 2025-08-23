"use client";

import { tmdb } from "@/hooks/useTmdb";

import Header from "@/components/Header";
import List from "@/sections/List";

interface HledatFilmyProps {
  query: string;
}

export default function HledatSerialy({ query }: HledatFilmyProps) {
  const decodedQuery = decodeURIComponent(query);
  
  return (
    <div className="page-serialy">
      <Header active="serialy" />
      <main className="main-container section-spacing">
        <List 
          header={`Hledání '${decodedQuery}'`} 
          type='tv' 
          fetchFunction={(params) => tmdb.get("/search/tv", { ...params, query: decodedQuery })} 
          cardCount={20}
        />
      </main>
    </div>
  );
}