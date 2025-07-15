import { useState, useEffect } from "react";
import Link from "next/link";

import SearchCard from "./SearchCard";
import { Button } from "@/components/ui/button";

import { MediaList, MediaDetails, Params } from "@/types/tmdbApi";

interface SearchBlockProps {
  search: string;
  fetchFunction: (params?: Params) => Promise<MediaList>;
  link: 'filmy' | 'serialy';
  typeName: string;
}

export default function SearchBlock({ search, fetchFunction, link, typeName }: SearchBlockProps) {
  const [mediaItems, setMediaItems] = useState<MediaDetails[]>([]);
  const [resultsLength, setResultsLength] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const showResults = 4;

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const result = await fetchFunction({ query: search });
      console.log("Search results:", result);
      setMediaItems(result.results || []);
      setResultsLength(result.total_results || 0);
      setIsLoading(false);
    }
    catch (error) {
      console.error('Error fetching data:', error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search]);

  if (!isLoading) return (
    <div className="w-80 bg-[var(--background)] flex flex-col gap-1 rounded-b-md pb-1.5 pointer-events-auto z-6">
      {mediaItems.length > 0 ? 
        mediaItems.slice(0, showResults).map((item) => (
          <SearchCard key={item.id} link={link} data={item} />
        ))
      :
        <div className="p-4 text-center text-gray-500">Žádné výsledky</div>
      }
      {mediaItems.length > showResults && (
        <Link href={`/${link}/hledat/${search}`} className="">
          <Button className="w-full !h-15" variant={'ghost'}>Zobrazit všechny {typeName} - {resultsLength}</Button>
        </Link>
      )}
    </div>
  )
  else return (
    <div className="w-80 bg-[var(--background-2)] flex flex-col gap-1 rounded-b-md pb-1.5">
      {Array.from({ length: 2 }).map((_, index) => (
        <SearchCard key={`search-card-skeleton-${index}`} link={link} data={undefined} />
      ))}
    </div>
  )
}