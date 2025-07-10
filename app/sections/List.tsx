import React, { useEffect, useState } from "react";

import Card from "@/components/Card";
import { Button } from "@/components/ui/button";

import { Plus } from "lucide-react";

import { MediaList, TmdbHookReturn } from "@/types/tmdbApi";

interface ListProps {
  header: string;
  icon?: React.ReactNode;
  type: "movie" | "tv";
  useFetch: (params?: Record<string, unknown>) => TmdbHookReturn<MediaList>;
}

export default function List({ header, icon, type, useFetch }: ListProps) {
  const [mediaItems, setMediaItems] = useState<MediaDetails[]>([]);
  const [totalCardCount, setTotalCardCount] = useState(0);

  const fetchData = async (page: number = 1) => {
    try {
      setTotalCardCount(prev => prev + 10);

      if (totalCardCount + 10 >= mediaItems.length) {
        const result = await fetchFunction({ page, excluded_genres: [10767, 10764, 10763] });
        if (page === 1) {
          setMediaItems(result.results || []);
        } else {
          setMediaItems(prev => [...prev, ...(result.results || [])]);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchData(1);
  }, []);

  return (
    <div>
      <div className="flex items-center gap-3 mb-4 opacity-90">
        {icon}
        <h2 className="font-bold text-2xl">{header}</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 gap-y-8">
        {Array.from({ length: totalCardCount }).map((_, index) => (
          <Card key={'card-' + index} details={mediaItems[index]} type={type} />
        ))}
      </div>
      {mediaItems.length > 0 && <div className="w-full flex justify-center align-middle">
        <Button variant={"ghost"} className="w-30 rounded-full border-2 !p-0 mt-4" onClick={()=>{fetchData(Math.floor(totalCardCount / 20) + 1)}}><Plus /></Button>
      </div>}
    </div>
  );
}