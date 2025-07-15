import Image from "next/image";

import { MediaDetails } from "@/types/tmdbApi";
import { tmdb } from "@/hooks/useTmdb";

interface SearchCardProps {
  data?: MediaDetails;
}

export default function SearchCard({ data }: SearchCardProps) {
  if (data) return (
    <div className="w-full h-30 p-[0.2rem] flex justify-between items-center">
      <Image 
        src={tmdb.image(data.poster_path || "")}
        alt={'poster image'}
        width={200} 
        height={600} 
        className="w-auto h-full rounded-md" 
      />
      <span>{data.title || data.name}</span>
    </div>
  )
}