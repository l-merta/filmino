import Link from "next/link";
import Image from "next/image";
import { tmdb } from "@/lib/useTmdb";

import Separator from "@/components/Separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import DateFormat from "@/components/DateFormat";
import { Skeleton } from "@/components/ui/skeleton";

import { MediaDetails, SeasonDetails } from "@/types/tmdbApi";

import { Star, Tv } from "lucide-react";
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
          className="w-full h-full object-cover object-top absolute z-2"
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
        <Skeleton className="w-full h-50 absolute top-0" />
        <div className="bg-[var(--background-2)] w-full h-20 blur-lg absolute bottom-[-2.0rem] left-0 scale-150 z-3"></div>
      </div>
      <div className="flex justify-between items-start flex-wrap gap-10 relative z-5">
        <div className="flex gap-4 flex-wrap">
          {seasonData.poster_path && 
            <div className="w-full max-w-40 h-fit aspect-[2/3] relative flex items-center justify-center">
              <Image
                src={tmdb.image(seasonData.poster_path || '')}
                alt={seasonData.name + ' poster'}
                width={1080}
                height={450}
                className="w-full h-fit rounded-md object-cover"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
              <Tv size={40} className="opacity-70 absolute z-[-1]" />
              <Skeleton className="w-full h-full rounded-md absolute z-[-2]" />
            </div>
          }
          <div className="w-fit pt-8 flex flex-col gap-4 relative">
            <Breadcrumb className="w-fit">
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
            <h2 className="w-fit text-xl mb-[-0.5rem]">{tvData.original_name}</h2>
            <h1 className="w-fit text-3xl font-bold">{seasonData.name}</h1>
            <div className="w-fit flex items-center gap-2">
              <MediaDataRow data={seasonData} />
            </div>
            {seasonData.overview && <p className="opacity-85 max-w-160 w-full line-clamp-8">{seasonData.overview}</p>}
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
    <>
    {data.episodes && data.episodes[0].air_date && 
      <>
      <DateFormat first_air_date={data.episodes[0].air_date} last_air_date={data.episodes[data.episodes.length - 1].air_date} in_production={false} />
      <Separator />
      </>
    }
    <Star className="h-4 w-4" />
    <span>{data.vote_average}</span>
    {data.episodes && 
      <>
      <Separator />
      <span>{data.episodes?.length} ep</span>
      </>
    }
    </>
  );
}