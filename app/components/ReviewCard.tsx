import Link from "next/link";
import Image from "next/image";
import { tmdb } from "@/lib/useTmdb";

import { Skeleton } from "./ui/skeleton";

import { ReviewDetails } from "@/types/tmdbApi";

import { Tv } from "lucide-react";

interface CardProps {
  details?: ReviewDetails;
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

export function ReviewCard({ details }: CardProps) {
  if (details) return (
    <div className="bg-gray-500 w-full">
      <span className="font-bold text-[1.0rem] mt-2 line-clamp-1">{details.author}</span>
      <span className="font-semibold text-[1.0rem] opacity-60">{details.updated_at.split('-')[0]}</span>
    </div>
  )
}

export default function Card({ details }: CardProps) {
  if (!details) return <SkeletonCard />
  if (details) return <ReviewCard details={details} />
}