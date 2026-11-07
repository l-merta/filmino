import Link from "next/link";
import Image from "next/image";
import { tmdb } from "@/lib/useTmdb";

import { Skeleton } from "@/components/ui/skeleton";

import { Tv, User } from "lucide-react";

import { MediaDetails, PersonSearchResult } from "@/types/tmdbApi";

export type SearchLink = 'filmy' | 'serialy' | 'herci';
export type SearchResult = Partial<MediaDetails> & Partial<PersonSearchResult> & { id: number };

interface SearchCardProps {
  data?: SearchResult;
  link: SearchLink;
}

export default function SearchCard({ data, link }: SearchCardProps) {
  const isPerson = link === 'herci';
  const original_name = data?.original_name || data?.original_title || data?.name;
  const name = data?.name || data?.title;
  const image = isPerson ? data?.profile_path : data?.poster_path;
  const Icon = isPerson ? User : Tv;
  const knownFor = isPerson ? data?.known_for?.map(k => k.title || k.name).filter(Boolean).slice(0, 2).join(", ") : null;

  if (data) return (
    <Link href={`/${link}/${data.id}`} className="w-full h-24 md:h-30 p-[0.3rem] !px-2 flex items-center gap-3 hover:scale-98 transition-transform duration-200">
      <div className="h-full aspect-[2/3] flex justify-center items-center relative shrink-0">
        {image && <Image 
          src={tmdb.image(image)}
          alt={'poster image'}
          width={200} 
          height={600} 
          className="w-full h-full object-cover rounded-md absolute z-3" 
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />}
        <Icon size={30} className="opacity-70 absolute z-2" />
        <Skeleton className="w-full h-full rounded-md absolute z-1" />
      </div>
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="font-bold text-[0.8rem] mt-2 line-clamp-1">{original_name}</span>
        {original_name !== name && <span className="font-semibold text-[0.8rem] opacity-60 line-clamp-1">{name}</span>}
        {knownFor && <span className="font-semibold text-[0.75rem] opacity-60 line-clamp-1">{knownFor}</span>}
      </div>
    </Link>
  )
  else return (
    <div className="w-full h-24 md:h-30 p-[0.3rem] !px-2 flex items-center gap-2">
      <Skeleton className="w-16 md:w-20 h-full" />
      <div className="flex flex-col gap-1">
        <Skeleton className="w-40 h-4" />
        <Skeleton className="w-20 h-4" />
      </div>
    </div>
  );
}
