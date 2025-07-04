import Image from "next/image";
import { tmdb } from "@/hooks/useTmdb";

import { Skeleton } from "./ui/skeleton";

import { MovieDetails } from "@/types/tmdbApi";

interface CardProps {
  details?: MovieDetails;
}

export default function Card({ details }: CardProps) {
  if (!details) { return (
    <div className="flex flex-col gap-2">
      <Skeleton className="w-full aspect-[2/3]" />
      <Skeleton className="w-full h-5" />
      <Skeleton className="w-30 h-5" />
    </div>
  )} else { return (
    <div className="flex flex-col gap-0.5">
      <div className="w-full aspect-[2/3] relative">
        <Image 
          src={tmdb.image(details.poster_path || details.backdrop_path || "")} 
          alt={details.title} 
          width={300} 
          height={450} 
          className="w-full h-full object-cover rounded-md absolute z-2" 
        />
        <Skeleton className="w-full h-full rounded-md absolute z-1" />
      </div>
      <span className="font-bold text-[1.0rem] mt-2 line-clamp-1">{details.original_title}</span>
      {details.original_title !== details.title && <span className="font-semibold text-[1.0rem] opacity-60 line-clamp-1">{details.title}</span>}
      <span className="font-semibold text-[1.0rem] opacity-60">{details.release_date.split('-')[0]}</span>
      <span className="font-semibold text-[1.0rem] opacity-60">[{details.id}]</span>
      {details.video && <span className="font-semibold text-[1.0rem] opacity-60">video</span>}
    </div>
  )}
}