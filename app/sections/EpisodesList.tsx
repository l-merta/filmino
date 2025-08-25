"use client";

import React from "react";
import { tmdb } from "@/lib/useTmdb";

import EpisodeCard from "@/components/EpisodeCard";
import { Button } from "@/components/ui/button";

import { Plus } from "lucide-react";

interface EpisodesListProps {
  header: string;
  icon?: React.ReactNode;
  tvId: number;
  seasonId: number;
}

export default function EpisodesList({ header, icon, tvId, seasonId }: EpisodesListProps) {
  const { data, isLoading, error } = tmdb.tv.Season(Number(tvId), Number(seasonId), { language: 'en' });
  const cardCountAdd = 16;

  const [totalCardCount, setTotalCardCount] = React.useState(cardCountAdd);

  if (error) {
    return (
      <div className="z-4">
        <div className="flex items-center gap-3 mb-4 opacity-90">
          {icon}
          <h2 className="font-bold text-2xl">{header}</h2>
        </div>
        <div className="text-red-500">Error loading episodes: {error.message}</div>
      </div>
    );
  }

  return (
    <div className="z-4">
      <div className="flex items-center gap-3 mb-4 opacity-90">
        {icon}
        <h2 className="font-bold text-2xl">{header}</h2>
        <span className="font-thin text-2xl">{data?.episodes?.length}</span>
      </div>
      {isLoading ? (
        // Loading skeletons
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 gap-y-8">
          {Array.from({ length: 8 }).map((_, index) => (
            <EpisodeCard tvId={tvId} key={`skeleton-${index}`} />
          ))}
        </div>
      ) : (
        // Actual series data
        (data && data.episodes && data.episodes.length > 0 && <>
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 gap-y-8">
            {Array.from({ length: totalCardCount }).map((_, index) => (
              (data.episodes && index < data.episodes.length && <EpisodeCard key={'card-' + index} tvId={tvId} details={data.episodes[index]} />)
            ))}
          </div>
          {data.episodes.length > 0 && totalCardCount < data.episodes.length && 
            <div className="w-full flex justify-center align-middle">
              <Button variant={"ghost"} className="button-outline w-30 rounded-full border-2 !p-0 mt-4" onClick={()=>{setTotalCardCount(prev => prev + cardCountAdd)}}><Plus /></Button>
            </div>
          }
        </>)
      )}
    </div>
  );
}