import Image from "next/image";

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
    <div className="flex flex-col gap-2">
      <Image src={'https://unsplash.it/1080/1920'} alt={details.title} width={undefined} height={undefined} className="w-full aspect-[2/3]" />
      <span className="font-bold text-lg">{details.title}</span>
    </div>
  )}
}