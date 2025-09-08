import Image from "next/image";
import Link from "next/link";
import { tmdb } from "@/lib/useTmdb";

import { Button } from "@/components/ui/button";
import Genre from "@/components/Genre";
import Video from "@/components/Video";
import Separator from "@/components/Separator";
import DateFormat from "@/components/DateFormat";
// import { AnimatedCircularProgressBar } from "@/components/magicui/animated-circular-progress-bar";
import { Skeleton } from "@/components/ui/skeleton";

import { MediaDetails } from "@/types/tmdbApi";

import { Timer, Star, Play, Monitor } from "lucide-react";

interface MediaHeroProps {
  data: MediaDetails | null;
  type: 'movie' | 'tv';
}

export default function MediaHero({ data, type }: MediaHeroProps) {
  const { data: images } = type == 'movie' ? 
    tmdb.movie.Images(Number(data?.id), { 
      include_image_language: data ? `cs,en,${data.original_language},null` : 'cs,en,null' 
    })
  :
    tmdb.tv.Images(Number(data?.id), { 
      include_image_language: data ? `cs,en,${data.original_language},null` : 'cs,en,null' 
    });

  const original_name = data?.original_name || data?.original_title;
  const name = data?.title || data?.name;

  const poster = images && (images.posters[0] || null);
  const logo = images && (images.logos[0] || null);
  const backdrop = images && (images.backdrops[0] || null);
  
  if (!data) return (
    <div className="mb-50">
      <div className="backdrop-container w-75/100 h-130 absolute right-0 top-20 flex items-center justify-center overflow-hidden z-0">
        <Skeleton className="w-full h-full" />
      </div>
      <div className="flex flex-col gap-4 relative z-2">
        <div className="shadow bg-[var(--background-2)] max-w-120 w-full h-140 rounded-t-xl blur-2xl rotate-[345deg] absolute top-0 left-0 z-0 scale-150"></div>
        <Skeleton className="w-120 h-30" /> 
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
        {type == "tv" && 
          <Skeleton className="w-35 h-10" />
        }
      </div>
    </div>
  )
  else return (
    <div className="mediaHero-thin">
      <div className="backdrop-container w-75/100 h-130 absolute right-0 top-20 flex items-center justify-center overflow-hidden">
        {backdrop && <Image 
          src={tmdb.image(backdrop.file_path)}
          alt={'backdrop image'}
          width={backdrop.width} 
          height={backdrop.height} 
          className="w-full h-full object-cover absolute z-1" 
        />}
        <div className="w-full h-full absolute z-2"><Video id={data.id} type={type} /></div>
      </div>
      <div className="media-info w-fit min-h-120 flex flex-col gap-4 relative z-3">
        <div className="shadow bg-[var(--background-2)] max-w-120 w-full h-140 rounded-t-xl blur-2xl rotate-[345deg] absolute top-0 left-0 z-[-1] scale-150"></div>
        <div className="w-full flex justify-between items-start gap-4">
          <div className="">
            {logo && 
              <div className="space-y-2">
                <Image 
                  src={tmdb.image(logo.file_path)}
                  alt={'logo image'}
                  width={logo.width} 
                  height={logo.height} 
                  className="max-w-100 w-full !max-h-35 object-contain object-left mb-3" 
                />
                {name !== original_name && <span className="font text-lg mb-3 opacity-80">{name}</span>}
              </div>
            }
            {!logo && poster && 
              <div className="space-y-2">
                <Image 
                  src={tmdb.image(poster.file_path)}
                  alt={'poster image'}
                  width={poster.width} 
                  height={poster.height} 
                  className="max-w-100 w-fit max-h-80 rounded-md" 
                />
                <span className="font-semibold text-xl mb-3">{name}</span>
              </div>
            }
          </div>
          {/* <AnimatedCircularProgressBar min={0} max={10} value={7.6} gaugePrimaryColor="black" gaugeSecondaryColor="gray" className="w-20 h-20" /> */}
        </div>
        <div className="max-w-140 flex flex-wrap gap-2">
          {data.genres.map((genre, index) => (
            <Genre key={'genre-id-' + genre + index} name={genre.name} link={`/${type == 'movie' ? 'filmy' : 'serialy'}/zanr/${genre.id}`} />
          ))}
        </div>
        <div className="flex items-center gap-3">
          <MediaDataRow data={data} type={type} />
        </div>
        {data.tagline && <p className="opacity-85 font-semibold max-w-140 w-screen">{data.tagline}</p>}
        <p className="opacity-85 max-w-140 w-screen line-clamp-5">{data.overview}</p>
        <div className="flex items-center gap-3">
          {type == "tv" && data.number_of_episodes && data.number_of_episodes > 0 && (
            <Link href={`/serialy/${data.id}/s01/e01`}>
              <Button variant='outline' className="w-fit flex items-center gap-2">
                <Play />
                Začít sledovat
              </Button>
            </Link>
          )}
          {type == "tv" &&
            <Link href={`/serialy/${data.id}/s01/e01`} className="pointer-events-none">
              <Button variant='default' className="w-fit flex items-center gap-2" disabled>
                <Monitor />
                Pokračovat ve sledování
              </Button>
            </Link>
          }
        </div>
      </div>
    </div>
  )
}

export function MediaDataRow({ data, type }: { data: MediaDetails, type: 'movie' | 'tv' }) {
  const iconSize = 16;

  if (type == 'movie') return (
    <>
    <span className="opacity-85">{data.release_date.split('-')[0] || ''}</span>
    <Separator />
    {data.vote_count > 0 && 
      <>
      <div className="flex items-center gap-2">
        <Star size={iconSize} />
        <span className="opacity-85">{data.vote_average.toFixed(1)}</span>
      </div>
      <Separator />
      </>
    }
    <div className="flex items-center gap-2">
      <Timer size={iconSize} />
      <span className="opacity-85">{data.runtime ? data.runtime + ' min' : 'N/A'}</span>
    </div>
    </>
  )
  else if (type == 'tv') return (
    <>
    <span className="opacity-85"><DateFormat first_air_date={data.first_air_date} last_air_date={data.last_air_date} in_production={data.in_production} /></span>
    {data.vote_count > 0 && 
      <>
      <Separator />
      <div className="flex items-center gap-2">
        <Star size={iconSize} />
        <span className="opacity-85">{data.vote_average.toFixed(1)}</span>
      </div>
      </>
    }
    {data.number_of_seasons ?
      <>
      <Separator />
      <span className="opacity-85">{data.number_of_seasons} {data.number_of_seasons > 4 ? 'sérií' : 'série'}</span>
      </>
    : ''
    }
    {data.number_of_episodes ? 
      <>
      <Separator />
      <span className="opacity-85">{data.number_of_episodes} ep</span>
      </>
    : ''
    }
    </>
  )
}