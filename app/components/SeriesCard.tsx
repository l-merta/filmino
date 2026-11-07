import Link from "next/link";
import Image from "next/image";
import { tmdb } from "@/lib/useTmdb";

import { Skeleton } from "./ui/skeleton";

import { SeasonDetails } from "@/types/tmdbApi";

import { Tv } from "lucide-react";

import ActionMenu from "@/components/collections/ActionMenu";
import LibraryBadges from "@/components/collections/LibraryBadges";

interface CardProps {
  details?: SeasonDetails;
  tvId?: number;
  tvName?: string;
}

export function SkeletonCard() {
  return (
    <div className="flex flex-col gap-2">
      <Skeleton className="w-full aspect-[2/3]" />
    </div>
  );
}

export function SeriesCard({ details, tvId, tvName }: CardProps) {
  const sNumber = "s" + (details ? details.season_number.toString().padStart(2, '0') : "00");

  if (details) return (
    <div className="relative group">
    {tvId && <ActionMenu
      className="absolute top-2 right-2 z-10"
      item={{ type: "season", tmdbId: tvId, seasonNumber: details.season_number, title: details.name, subtitle: tvName, posterPath: details.poster_path, year: details.air_date?.split('-')[0] || null }}
    />}
    <Link href={'/serialy/' + tvId + '/' + sNumber} className="flex flex-col gap-0.5 hover:scale-98 transition-transform duration-200">
      <div className="w-full aspect-[2/3] relative flex items-center justify-center">
        <Image 
          src={tmdb.image(details.poster_path || "")} 
          alt={details.name} 
          width={300} 
          height={450} 
          className="w-full h-full object-cover rounded-md absolute z-3" 
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
        <Tv size={40} className="opacity-70 absolute z-2" />
        <Skeleton className="w-full h-full rounded-md absolute z-1" />
        <LibraryBadges mediaKey={`season:${tvId}:${details.season_number}`} className="absolute bottom-2 left-2 z-4" />
      </div>
      <span className="font-bold text-[1.0rem] mt-2 line-clamp-1">{details.name}</span>
      <span className="font-semibold text-[1.0rem] opacity-60 line-clamp-1">{details.episode_count} epizod</span>
      {/* <span className="font-semibold text-[1.0rem] opacity-60 line-clamp-1">ID {details.id} - {details.season_number}</span> */}
    </Link>
    </div>
  )
}

export default function ActorCard({ details, tvId, tvName }: CardProps) {
  if (!details || !tvId) return <SkeletonCard />
  if (details) return <SeriesCard details={details} tvId={tvId} tvName={tvName} />
}