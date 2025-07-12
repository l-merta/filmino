"use client";

import React, { useEffect, useState } from "react";

import Card from "@/components/Card";
import { Button } from "@/components/ui/button";

import { Plus } from "lucide-react";

import { MediaList, MediaDetails, Params } from "@/types/tmdbApi";

interface ListProps {
  header: string;
  icon?: React.ReactNode;
  type: "movie" | "tv";
  fetchFunction: (params?: Params) => Promise<MediaList>;
  cardCount?: number;
}

export default function List({ header, icon, type, fetchFunction, cardCount }: ListProps) {
  const [mediaItems, setMediaItems] = useState<MediaDetails[]>([]);
  const [totalCardCount, setTotalCardCount] = useState(cardCount || 10);

  const fetchData = async (page: number = 1, increaseCardCount: boolean = true) => {
    try {
      const newTotalCardCount = increaseCardCount ? totalCardCount + (cardCount || 10) : totalCardCount;

      setTotalCardCount(newTotalCardCount);

      if (newTotalCardCount > mediaItems.length) {
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
    fetchData(1, false);
  }, []);

  return (
    <div className="z-4">
      <div className="flex items-center gap-3 mb-4 opacity-90">
        {icon}
        <h2 className="font-bold text-2xl">{header}</h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 gap-y-8">
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