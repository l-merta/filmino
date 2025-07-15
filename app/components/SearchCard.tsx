import Image from "next/image";

import { MediaDetails } from "@/types/tmdbApi";
import { tmdb } from "@/hooks/useTmdb";

interface SearchCardProps {
  data?: MediaDetails;
}

export default function SearchCard({ data }: SearchCardProps) {
  if (true) return (
    <div className="bg-red-500 w-full h-30 p-[0.2rem] flex justify-between items-center">
      <Image 
        src={tmdb.image("ombsmhYUqR4qqOLOxAyr5V8hbyv.jpg")}
        alt={'poster image'}
        width={200} 
        height={600} 
        className="w-auto h-full rounded-md" 
      />
    </div>
  )
}