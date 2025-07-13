import Image from "next/image";
import { tmdb } from "@/hooks/useTmdb";

import Genre from "@/components/Genre";

import { Timer } from "lucide-react";

import { MediaDetails } from "@/types/tmdbApi";
import { Skeleton } from "@/components/ui/skeleton";

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

  const name = data?.title || data?.name;

  const poster = images && (images.posters[0] || null);
  const logo = images && (images.logos[0] || null);
  const backdrop = images && (images.backdrops[0] || null);
  
  if (!data) return (
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
  else return (
    <>
    <div className="w-75/100 h-120 absolute right-0 top-20 flex items-center justify-center overflow-hidden">
      {backdrop && <Image 
        src={tmdb.image(backdrop.file_path)}
        alt={'backdrop image'}
        width={backdrop.width} 
        height={backdrop.height} 
        className="w-full h-full object-cover absolute z-1" 
      />}
    </div>
    <div className="w-fit min-h-120 flex flex-col gap-4 relative z-3">
      <div className="bg-[var(--background-2)] max-w-120 w-full h-140 rounded-t-xl blur-2xl rotate-[345deg] absolute top-0 left-0 z-[-1] scale-150"></div>
      {logo && <Image 
        src={tmdb.image(logo.file_path)}
        alt={'logo image'}
        width={logo.width} 
        height={logo.height} 
        className="max-w-100 w-full !max-h-50 object-contain object-left mb-3" 
      />}
      {!logo && poster && 
        <>
        <Image 
          src={tmdb.image(poster.file_path)}
          alt={'poster image'}
          width={poster.width} 
          height={poster.height} 
          className="max-w-100 w-fit max-h-80 rounded-md" 
        />
        <span className="font-semibold text-xl mb-3">{name}</span>
        </>
      }
      <div className="max-w-screen flex flex-wrap gap-2">
        {data.genres.map((genre, index) => (
          <Genre key={'genre-id-' + genre + index} name={genre.name} link={`/${type == 'movie' ? 'filmy' : 'serialy'}/zanr/${genre.id}`} />
        ))}
      </div>
      <div className="flex items-center gap-2">
        <MediaDataRow data={data} type={type} />
      </div>
      {data.tagline && <p className="opacity-85 font-semibold max-w-140 w-screen">{data.tagline}</p>}
      <p className="opacity-85 max-w-140 w-screen line-clamp-5">{data.overview}</p>
    </div>
    </>
  )
}

export function MediaDataRow({ data, type }: { data: MediaDetails, type: 'movie' | 'tv' }) {
  if (type == 'movie') return (
    <>
    <span className="opacity-85">{data.release_date.split('-')[0]}</span>
    <span className="font-bold">/</span>
    <div className="flex items-center gap-2">
      <Timer size={18} />
      <span className="opacity-85">{data.runtime ? data.runtime + ' min' : 'N/A'}</span>
    </div>
    </>
  )
  else if (type == 'tv') return (
    <>
    <span className="opacity-85">{data.first_air_date.split('-')[0]}</span>
    {data.status == "Ended" ? 
      <>
      <span className="font-bold">/</span>
      <span className="opacity-85">Ukončeno</span>
      </>
    : ''
    }
    {data.number_of_seasons ?
      <>
      <span className="font-bold">/</span>
      <span className="opacity-85">{data.number_of_seasons} {data.number_of_seasons > 4 ? 'sérií' : 'série'}</span>
      </>
    : ''
    }
    {data.number_of_episodes ? 
      <>
      <span className="font-bold">/</span>
      <span className="opacity-85">{data.number_of_episodes} ep</span>
      </>
    : ''
    }
    </>
  )
}