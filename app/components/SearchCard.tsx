import Link from "next/link";
import Image from "next/image";

import { Skeleton } from "@/components/ui/skeleton";

import { MediaDetails } from "@/types/tmdbApi";
import { tmdb } from "@/hooks/useTmdb";

interface SearchCardProps {
  data?: MediaDetails;
  link: 'filmy' | 'serialy';
}

export default function SearchCard({ data, link }: SearchCardProps) {
  const original_name = data?.original_name || data?.original_title;
  const name = data?.name || data?.title;

  if (data) return (
    <Link href={`/${link}/${data.id}`} className="w-full h-30 p-[0.3rem] !px-2 flex items-center gap-3 hover:scale-98 transition-transform duration-200">
      <div className="h-full aspect-[2/3] relative">
        <Image 
          src={tmdb.image(data.poster_path || "")}
          alt={'poster image'}
          width={200} 
          height={600} 
          className="w-auto h-full rounded-md absolute z-2" 
        />
        <Skeleton className="h-full aspect-[2/3]" />
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="font-bold text-[0.8rem] mt-2 line-clamp-1">{original_name}</span>
        {original_name !== name && <span className="font-semibold text-[0.8rem] opacity-60 line-clamp-1">{name}</span>}
      </div>
    </Link>
  )
  else return (
    <div className="w-full h-30 p-[0.3rem] !px-2 flex items-center gap-2">
      <Skeleton className="w-20 h-full" />
      <div className="flex flex-col gap-1">
        <Skeleton className="w-40 h-4" />
        <Skeleton className="w-20 h-4" />
      </div>
    </div>
  );
}