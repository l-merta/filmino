"use client";

import Genre from "@/components/Genre";
import { Skeleton } from "@/components/ui/skeleton";

import { GenreList as GenreListType, TmdbHookReturn } from "@/types/tmdbApi";

interface GenreListProps {
  useFetch: () => TmdbHookReturn<GenreListType>;
  active?: number;
  type: 'filmy' | 'serialy';
}

export default function GenreList({ useFetch, active, type }: GenreListProps) {
  const { data } = useFetch();

  if (!data) return (
    <div className="flex flex-wrap gap-2">
      {Array.from({ length: 8 }).map((_, index) => (
        <Skeleton key={'genre-skeleton-' + index} className="w-20 h-8" />
      ))}
    </div>
  )
  else return (
    <div className="flex flex-wrap gap-2">
      {data.genres.map((genre) => (
        <Genre key={genre.id} name={genre.name} link={'/' + type + '/zanr/' + genre.id} special={active == genre.id ? 'active' : undefined} />
      ))}
    </div>
  )
}