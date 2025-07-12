import Link from "next/link";
import Image from "next/image";
import { tmdb } from "@/hooks/useTmdb";

import { Card, CardContent } from "@/components/ui/card"
import {
  CarouselItem,
} from "@/components/ui/carousel"

import { MediaDetails } from "@/types/tmdbApi";

interface CarouselItemProps {
  data: MediaDetails | null;
  type: 'movie' | 'tv';
}

export default function CarouselItemComponent({ data, type }: CarouselItemProps) {
  const { data: images } = type == 'movie' ? 
    tmdb.movie.Images(Number(data?.id), { 
      include_image_language: data ? `cs,en,${data.original_language},null` : 'cs,en,null' 
    })
  :
    tmdb.tv.Images(Number(data?.id), { 
      include_image_language: data ? `cs,en,${data.original_language},null` : 'cs,en,null' 
    });

  const backdrop = images && (images.backdrops[0] || null);
  const logo = images && (images.logos[0] || null);

  if (data) return (
    <CarouselItem className="">
      <Link href={`/${type == 'movie' ? 'filmy' : 'serialy'}/${data.id}`} className="hover:scale-95 transition-transform duration-200">
        <Card className="!overflow-hidden rounded-[2rem] p-0 border-0">
          <CardContent className="w-full h-110 p-0 flex items-center justify-center relative">
            {backdrop && <Image 
              src={tmdb.image(backdrop.file_path)}
              alt={'backdrop image'}
              width={backdrop.width} 
              height={backdrop.height} 
              className="w-full h-full rounded-[2rem] object-cover" 
            />}
            {logo && <Image 
              src={tmdb.image(logo.file_path)}
              alt={'logo image'}
              width={logo.width} 
              height={logo.height} 
              className="w-80 object-cover absolute bottom-6 left-8" 
            />}
          </CardContent>
        </Card>
      </Link>
    </CarouselItem>
  )
}