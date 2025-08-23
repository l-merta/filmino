"use client";

import React, { useEffect, useState } from "react";

import ActorCard from "@/components/ActorCard";
import { Button } from "@/components/ui/button";

import { Plus } from "lucide-react";

import { ActorList, ActorDetails, Params } from "@/types/tmdbApi";

interface ListProps {
  header: string;
  icon?: React.ReactNode;
  type: "movie" | "tv";
  fetchFunction: (params?: Params) => Promise<ActorList>;
  cardCount?: number;
}

export default function List({ header, icon, type, fetchFunction, cardCount }: ListProps) {
  const [actorItems, setActorItems] = useState<ActorDetails[]>([]);
  const [totalCardCount, setTotalCardCount] = useState(cardCount || 10);
  
  const [totalPages, setTotalPages] = useState(0);

  const fetchData = async (page: number = 1, increaseCardCount: boolean = true) => {
    try {
      const newTotalCardCount = increaseCardCount ? totalCardCount + (cardCount || 10) : totalCardCount;

      setTotalCardCount(newTotalCardCount);

      if (newTotalCardCount > actorItems.length) {
        const result = await fetchFunction({ page });
        setTotalPages(Math.ceil(result.cast.length / 20) - 1 || 0);
        if (page === 1) {
          setActorItems(result.cast || []);
        } else {
          setActorItems(prev => [...prev, ...(result.cast || [])]);
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
          (index < actorItems.length && <ActorCard key={'card-' + index} type={type} details={actorItems[index]} />)
        ))}
      </div>
      {actorItems.length > 0 && (Math.floor(totalCardCount / 20)) < totalPages && <div className="w-full flex justify-center align-middle">
        <Button variant={"ghost"} className="button-outline w-30 rounded-full border-2 !p-0 mt-4" onClick={()=>{fetchData(Math.floor(totalCardCount / 20) + 1)}}><Plus /></Button>
      </div>}
    </div>
  );
}