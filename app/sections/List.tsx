import { useEffect, useState } from "react";

import Card from "@/components/Card";
import { Button } from "@/components/ui/button";

import { Plus } from "lucide-react";

import { MovieList, MovieDetails } from "@/types/tmdbApi";

interface ListProps {
  header: string;
  fetchFunction: (params?: Record<string, unknown>) => Promise<MovieList>;
}

export default function List({ header, fetchFunction }: ListProps) {
  const [mediaItems, setMediaItems] = useState<MovieDetails[]>([]);
  const [totalCardCount, setTotalCardCount] = useState(0);

  const fetchData = async (page: number = 1) => {
    try {
      setTotalCardCount(prev => prev + 10);

      if (totalCardCount + 10 >= mediaItems.length) {
        const result = await fetchFunction({ page });
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
      <h2 className="font-bold text-2xl mb-4 opacity-90">{header}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 gap-y-8">
        {Array.from({ length: totalCardCount }).map((_, index) => (
          <Card key={'card-' + index} details={mediaItems[index]} />
        ))}
      </div>
      {mediaItems.length > 0 && <div className="w-full flex justify-center align-middle">
        <Button variant={"ghost"} className="w-30 rounded-full border-2 !p-0 mt-4" onClick={()=>{fetchData(Math.floor(totalCardCount / 20) + 1)}}><Plus /></Button>
      </div>}
    </div>
  );
}