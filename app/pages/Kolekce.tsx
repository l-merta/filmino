"use client";

import { tmdb } from "@/lib/useTmdb";

import Header from "@/components/Header";
import CollectionList from "@/sections/CollectionList";
import FakeList from "@/sections/FakeList";

import ErrorPage from "./Error";

interface KolekceProps {
  collectionId: number;
}

export default function Kolekce({ collectionId }: KolekceProps) {
  const { data: collectionData, isLoading, error: collectionError } = tmdb.collection.Details(collectionId);

  if (collectionError) return <ErrorPage code={404} title="Kolekce nenalezena" message="Omlouváme se, ale požadovaná kolekce nebyla nalezena." type="movie" />;

  return (
    <div className="page-filmy">
      <Header active="filmy" />
      <main className="main-container section-spacing">
        {collectionData ? 
          <CollectionList header={collectionData.name} type='movie' fetchFunction={(params) => tmdb.get("/collection/"+collectionId, params)} />
        :
          <FakeList header="Kolekce" />
        }
      </main>
    </div>
  );
}