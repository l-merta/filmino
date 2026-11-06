import { useState, useEffect } from "react";
import Link from "next/link";

import SearchCard, { type SearchLink, type SearchResult } from "./SearchCard";
import { Button } from "@/components/ui/button";

import { Params } from "@/types/tmdbApi";

interface SearchBlockProps {
  search: string;
  fetchFunction: (params?: Params) => Promise<{ results?: SearchResult[]; total_results?: number }>;
  link: SearchLink;
  typeName: string;
  onNavigate?: () => void;
}

export default function SearchBlock({ search, fetchFunction, link, typeName, onNavigate }: SearchBlockProps) {
  const [mediaItems, setMediaItems] = useState<SearchResult[]>([]);
  const [resultsLength, setResultsLength] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const showResults = 4;

  useEffect(() => {
  let isCurrent = true; // flag for stale results

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const result = await fetchFunction({ query: search });

      // Only update state if this is the latest fetch
      if (!isCurrent) return;

      setMediaItems(result.results || []);
      setResultsLength(result.total_results || 0);
    } catch (error) {
      if (!isCurrent) return;
      console.error("Error fetching data:", error);
    } finally {
      if (isCurrent) setIsLoading(false);
    }
  };

  fetchData();

  // cleanup function marks this fetch as obsolete
  return () => {
    isCurrent = false;
  };
}, [search, fetchFunction]);

  if (!isLoading) return (
    <div className="w-full md:w-80 bg-[var(--background)] flex flex-col gap-1 rounded-md md:rounded-t-none pb-1.5 pointer-events-auto z-6" onClick={onNavigate}>
      <span className="px-3 pt-2 text-xs uppercase tracking-wide opacity-60">{typeName}</span>
      {mediaItems.length > 0 ? 
        mediaItems.slice(0, showResults).map((item) => (
          <SearchCard key={item.id} link={link} data={item} />
        ))
      :
        <div className="p-4 text-center text-gray-500">Žádné výsledky</div>
      }
      {mediaItems.length > showResults && (
        <Link href={`/${link}/hledat/${encodeURIComponent(search)}`} className="">
          <Button className="w-full !h-12 md:!h-15" variant={'ghost'}>Zobrazit všechny {typeName} - {resultsLength}</Button>
        </Link>
      )}
    </div>
  )
  else return (
    <div className="w-full md:w-80 bg-[var(--background-2)] flex flex-col gap-1 rounded-md md:rounded-t-none pb-1.5">
      {Array.from({ length: 2 }).map((_, index) => (
        <SearchCard key={`search-card-skeleton-${index}`} link={link} data={undefined} />
      ))}
    </div>
  )
}
