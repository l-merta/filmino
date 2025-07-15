import { useState, useEffect } from "react";

import SearchCard from "./SearchCard";

import { MediaList, MediaDetails, Params } from "@/types/tmdbApi";

interface SearchBlockProps {
  search: string;
  fetchFunction: (params?: Params) => Promise<MediaList>;
}

export default function SearchBlock({ search, fetchFunction }: SearchBlockProps) {
  const [mediaItems, setMediaItems] = useState<MediaDetails[]>([]);

  const fetchData = async () => {
    try {
      const result = await fetchFunction({ });
      console.log("Search results:", result);
      setMediaItems(result.results || []);
    }
    catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [fetchFunction, search]);

  return (
    <div className="w-80 bg-[var(--background-2)] flex flex-col gap-1">
      {mediaItems && mediaItems.length > 0 ? (
        mediaItems.slice(0, 5).map((item) => (
          <SearchCard key={item.id} data={item} />
        ))
      ) : (
        <div className="text-center text-gray-500">No results found</div>
      )}
    </div>
  );
}