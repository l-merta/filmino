import Link from "next/link";
import Image from "next/image";
import { tmdb } from "@/lib/useTmdb";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "./ui/skeleton";

import { ReviewDetails } from "@/types/tmdbApi";

import { Tv } from "lucide-react";

interface CardProps {
  details?: ReviewDetails;
}

export function SkeletonCard() {
  return (
    <div className="!w-full flex gap-4">
      <Skeleton className="w-15 h-15 rounded-full" />
      <div className="flex flex-col gap-4 w-full">
        <Skeleton className="w-35 h-5" />
        <Skeleton className="w-full h-40" />
      </div>
    </div>
  );
}

export function ReviewCard({ details }: CardProps) {
  if (details) return (
    <div className="w-full flex gap-4">
      <div className="w-15 h-15 rounded-full overflow-hidden flex justify-center items-center relative">
        <Avatar className="w-15 h-15">
          <AvatarImage src={tmdb.image(details.author_details.avatar_path || "")} />
          <AvatarFallback className="text-xl">{details.author_details.username && details.author_details.username.substring(0, 1).toUpperCase()}</AvatarFallback>
        </Avatar>
      </div>
      <div className="flex flex-col gap-2 w-full">
        <div className="flex gap-2 items-center">
          <span className="font-semibold">{details.author}</span>
          <span className="opacity-80">{details.updated_at}</span>
        </div>
        <p className="line-clamp-5 opacity-80">{details.content}</p>
      </div>
    </div>
  )
}

export default function Card({ details }: CardProps) {
  if (!details) return <SkeletonCard />
  if (details) return <ReviewCard details={details} />
}