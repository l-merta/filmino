"use client";

import React, { useEffect, useState } from "react";

import List from "@/sections/List";
import Card from "@/components/Card";
import { Button } from "@/components/ui/button";

import { Plus } from "lucide-react";

import { ActorMediaDetails, MediaDetails, Params } from "@/types/tmdbApi";

interface ListProps {
  header: string;
  icon?: React.ReactNode;
  type: "movie" | "tv";
  fetchFunction: (params?: Params) => Promise<ActorMediaDetails>;
  cardCount?: number;
}

export default function ActorMediaList({ header, icon, type, fetchFunction, cardCount }: ListProps) {
  const [mediaItems, setMediaItems] = useState<MediaDetails[]>([]);
  const [totalCardCount, setTotalCardCount] = useState(cardCount || 10);
  
  const [totalPages, setTotalPages] = useState(0);

  const fetchData = async (page: number = 1, increaseCardCount: boolean = true) => {
    try {
      const newTotalCardCount = increaseCardCount ? totalCardCount + (cardCount || 10) : totalCardCount;

      setTotalCardCount(newTotalCardCount);

      if (newTotalCardCount > mediaItems.length) {
        const result = await fetchFunction({ page });
        //console.log("MediaList data", result);
        setTotalPages(Math.floor(result.cast.length / 20) || 0);
        if (page === 1) {
          setMediaItems(result.cast || []);
        } else {
          setMediaItems(prev => [...prev, ...(result.cast || [])]);
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
    <List header={header} icon={icon}>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 gap-y-8">
        {Array.from({ length: totalCardCount }).map((_, index) => (
          (mediaItems.length == 0 && <Card key={'card-' + index} details={mediaItems[index]} type={type} />) ||
          (index < mediaItems.length && <Card key={'card-' + index} details={mediaItems[index]} type={type} />)
        ))}
      </div>
      {mediaItems.length > 0 && (Math.floor(totalCardCount / 20)) < totalPages && <div className="w-full flex justify-center align-middle">
        <Button variant={"ghost"} className="button-outline w-30 rounded-full border-2 !p-0 mt-4" onClick={()=>{fetchData(Math.floor(totalCardCount / 20) + 1)}}><Plus /></Button>
      </div>}
    </List>
  );
}