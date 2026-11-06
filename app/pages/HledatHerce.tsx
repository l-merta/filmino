"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, User } from "lucide-react";

import { tmdb } from "@/lib/useTmdb";

import Header from "@/components/Header";
import List from "@/sections/List";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import { PersonSearchList, PersonSearchResult } from "@/types/tmdbApi";

/** /herci/hledat/:query — actor search results */
export default function HledatHerce({ query }: { query: string }) {
  const decodedQuery = decodeURIComponent(query);
  const [people, setPeople] = useState<PersonSearchResult[] | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    tmdb.get<PersonSearchList>("/search/person", { query: decodedQuery, page }).then((res) => {
      setTotalPages(res.total_pages || 1);
      setPeople((prev) => (page === 1 ? res.results : [...(prev ?? []), ...res.results]));
    }).catch(() => setPeople((p) => p ?? []));
  }, [decodedQuery, page]);

  return (
    <div className="page-filmy">
      <Header />
      <main className="main-container section-spacing">
        <List header={`Hledání herců '${decodedQuery}'`}>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 gap-y-8">
            {people === null
              ? Array.from({ length: 12 }).map((_, i) => <Skeleton key={i} className="w-full aspect-[2/3]" />)
              : people.map((p) => (
                  <Link key={p.id} href={`/herci/${p.id}`} className="flex flex-col gap-0.5 hover:scale-98 transition-transform duration-200">
                    <div className="w-full aspect-[2/3] relative flex items-center justify-center">
                      {p.profile_path && (
                        <Image src={tmdb.image(p.profile_path)} alt={p.name} width={300} height={450} className="w-full h-full object-cover rounded-md absolute z-3" />
                      )}
                      <User size={40} className="opacity-70 absolute z-2" />
                      <Skeleton className="w-full h-full rounded-md absolute z-1" />
                    </div>
                    <span className="font-bold mt-2 line-clamp-1">{p.name}</span>
                    <span className="font-semibold opacity-60 line-clamp-1">
                      {p.known_for?.map((k) => k.title || k.name).filter(Boolean).slice(0, 2).join(", ")}
                    </span>
                  </Link>
                ))}
          </div>
          {people && people.length === 0 && <p className="opacity-70">Žádné výsledky</p>}
          {people && page < totalPages && (
            <div className="w-full flex justify-center">
              <Button variant="ghost" className="button-outline w-30 rounded-full border-2 !p-0 mt-4" onClick={() => setPage((p) => p + 1)}><Plus /></Button>
            </div>
          )}
        </List>
      </main>
    </div>
  );
}
