import Link from "next/link";
import Image from "next/image";
import { tmdb } from "@/lib/useTmdb";

import Genre from "@/components/Genre";
import Separator from "@/components/Separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Skeleton } from "@/components/ui/skeleton";

import { MediaDetails, SeasonDetails } from "@/types/tmdbApi";

import { Timer, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MediaHeroProps {
  tvData: MediaDetails | null;
  seasonData: SeasonDetails | null;
}

export default function MediaHero({ tvData, seasonData }: MediaHeroProps) {
  if (!tvData || !tvData.seasons || !seasonData) return (
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
  else { 
    const isFirstSeason = seasonData.season_number === tvData.seasons[0].season_number;
    const isLastSeason = seasonData.season_number === tvData.seasons[tvData.seasons.length - 1].season_number;

    return (
    <div className="pt-30 pb-10">
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
      <div className="flex justify-between items-start gap-10 relative z-5">
        <div className="flex gap-4">
          <Image
            src={tmdb.image(seasonData.poster_path || '')}
            alt={seasonData.name + ' poster'}
            width={1080}
            height={450}
            className="w-full max-w-55 h-fit rounded-md"
          />
          <div className="w-fit pt-8 flex flex-col gap-4 relative">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href="/serialy">Seriály</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href={"/serialy/" + tvData.id}>{tvData.original_name}</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{seasonData.name}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <h2 className="text-xl mb-[-0.5rem]">{tvData.original_name}</h2>
            <h1 className="text-3xl font-bold">{seasonData.name}</h1>
            <div className="flex items-center gap-2">
              <span>{seasonData.episodes?.length} ep</span>
              <Separator />
              <Star className="h-4 w-4" />
              <span>{seasonData.vote_average}</span>
            </div>
            <p className="opacity-85 max-w-160 w-screen line-clamp-8">{seasonData.overview}</p>
          </div>
        </div>
        <div className="flex gap-2 pt-8">
          {tvData.seasons && (
            <>
              <Button 
                variant="outline" 
                className="button-outline"
                disabled={isFirstSeason}
              >
                <Link 
                  href={isFirstSeason ? '#' : `/serialy/${tvData.id}/s${String(seasonData.season_number - 1).padStart(2, '0')}`}
                >
                  Předchozí série
                </Link>
              </Button>
              <Button 
                variant="outline" 
                className="button-outline"
                disabled={isLastSeason}
              >
                <Link 
                  href={isLastSeason ? '#' : `/serialy/${tvData.id}/s${String(seasonData.season_number + 1).padStart(2, '0')}`}
                >
                  Další série
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )}
}

export function MediaDataRow({ data }: { data: SeasonDetails }) {
  return (
    <></>
  );
}