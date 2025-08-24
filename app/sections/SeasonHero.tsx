import Image from "next/image";
import { tmdb } from "@/hooks/useTmdb";

import Genre from "@/components/Genre";
import Separator from "@/components/Separator";
import { Skeleton } from "@/components/ui/skeleton";

import { MediaDetails, SeasonDetails } from "@/types/tmdbApi";

import { Timer, Star } from "lucide-react";

interface MediaHeroProps {
  tvData: MediaDetails | null;
  seasonData: SeasonDetails | null;
}

export default function MediaHero({ tvData, seasonData }: MediaHeroProps) {
  if (!tvData || !seasonData) return (
    <div className="flex flex-col gap-4">
      <Skeleton className="w-100 h-30" /> 
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={'genre-skeleton-' + index} className="w-20 h-8" />
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={'data-row-skeleton-' + index} className="w-30 h-5" />
        ))}
      </div>
      <div className="flex flex-col gap-2">
        <Skeleton className="w-140 h-4" />
        <Skeleton className="w-140 h-4" />
        <Skeleton className="w-80 h-4" />
      </div>
    </div>
  )
  else return (
    <div className="pt-30">
      <div className="w-full h-50 absolute left-0 top-20 z-0">
        <Image
          src={tmdb.image(tvData.backdrop_path || '')}
          alt={tvData.name + ' backdrop'}
          width={1080}
          height={450}
          className="w-full h-full object-cover object-top"
        />
        <div className="bg-[var(--background-2)] w-full h-20 blur-lg absolute bottom-[-2.0rem] left-0 scale-150"></div>
      </div>
      <div className="relative z-5">
        <Image
          src={tmdb.image(seasonData.poster_path || '')}
          alt={seasonData.name + ' poster'}
          width={1080}
          height={450}
          className="w-full max-w-70 rounded-md"
        />
      </div>
      
    </div>
  )
}

export function MediaDataRow({ data }: { data: SeasonDetails }) {
  return (
    <></>
  );
}