import Link from "next/link";
import Image from "next/image";
import { tmdb } from "@/hooks/useTmdb";

import { Skeleton } from "./ui/skeleton";

import { EpisodeDetails } from "@/types/tmdbApi";

import { Tv } from "lucide-react";

interface CardProps {
  details?: EpisodeDetails;
  tvId: number;
}

export function SkeletonCard() {
  return (
    <div className="flex flex-col gap-2">
      <Skeleton className="w-full aspect-[2/3]" />
      <Skeleton className="w-full h-5" />
      <Skeleton className="w-30 h-5" />
    </div>
  );
}

export function EpisodeCard({ details, tvId }: CardProps) {
  const sNumber = "s" + (details ? details.season_number.toString().padStart(2, '0') : "00");
  const eNumber = "e" + (details ? details.episode_number.toString().padStart(2, '0') : "00");

  if (details) return (
    <Link href={'/serialy/' + tvId + "/" + sNumber + "/" + eNumber} className="flex flex-col gap-0.5 hover:scale-98 transition-transform duration-200 z-3">
      <div className="w-full aspect-[16/9] relative flex items-center justify-center">
        <Image 
          src={tmdb.image(details.still_path || "")} 
          alt={details.name} 
          width={300} 
          height={450} 
          className="w-full h-full object-cover rounded-md absolute z-3" 
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
        <Tv size={40} className="opacity-70 absolute z-2" />
        <Skeleton className="w-full h-full rounded-md absolute z-1" />
      </div>
      <div className="flex justify-between gap-2 mt-2">
        <span className="font-bold text-[1.0rem] line-clamp-1">{details.name}</span>
        <span className="font-semibold text-[1.0rem] opacity-60 white-space-nowrap">{sNumber}{eNumber}</span>
      </div>
      {details.runtime && <span className="font-semibold text-[1.0rem] opacity-60 line-clamp-1">{details.runtime} min</span>}
    </Link>
  )
}

export default function ActorCard({ details, tvId }: CardProps) {
  if (!details) return <SkeletonCard />
  if (details) return <EpisodeCard details={details} tvId={tvId} />
}