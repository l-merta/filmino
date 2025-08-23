import Link from "next/link";
import Image from "next/image";
import { tmdb } from "@/hooks/useTmdb";

import { Skeleton } from "./ui/skeleton";

import { ActorDetails } from "@/types/tmdbApi";

interface CardProps {
  type: 'movie' | 'tv';
  details?: ActorDetails;
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

export function MovieActorCard({ details }: CardProps) {
  if (details) return (
    <Link href={'/filmy/' + details.id} className="flex flex-col gap-0.5 hover:scale-98 transition-transform duration-200">
      <div className="w-full aspect-[2/3] relative">
        <Image 
          src={tmdb.image(details.profile_path || "")} 
          alt={details.name} 
          width={300} 
          height={450} 
          className="w-full h-full object-cover rounded-md absolute z-2" 
        />
        <Skeleton className="w-full h-full rounded-md absolute z-1" />
      </div>
      <span className="font-bold text-[1.0rem] mt-2 line-clamp-1">{details.name}</span>
      <span className="font-semibold text-[1.0rem] opacity-60 line-clamp-1">{details.character}</span>
    </Link>
  )
}

export function TvActorCard({ details }: CardProps) {
  if (details) return (
    <Link href={'/filmy/' + details.id} className="flex flex-col gap-0.5 hover:scale-98 transition-transform duration-200">
      <div className="w-full aspect-[2/3] relative">
        <Image 
          src={tmdb.image(details.profile_path || "")} 
          alt={details.name} 
          width={300} 
          height={450} 
          className="w-full h-full object-cover rounded-md absolute z-2" 
        />
        <Skeleton className="w-full h-full rounded-md absolute z-1" />
      </div>
      <span className="font-bold text-[1.0rem] mt-2 line-clamp-1">{details.name}</span>
      <span className="font-semibold text-[1.0rem] opacity-60 line-clamp-1">{details.roles[0]?.character}</span>
      <span className="font-semibold text-[1.0rem] opacity-60 line-clamp-1">{details.roles[0]?.episode_count} epizod</span>
    </Link>
  )
}

export default function ActorCard({ details, type }: CardProps) {
  if (!details) return <SkeletonCard />
  if (type == 'movie') return <MovieActorCard type={type} details={details} />
  if (type == 'tv') return <TvActorCard type={type} details={details} />
}