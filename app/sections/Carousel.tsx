"use client"

import * as React from "react"
import Autoplay from "embla-carousel-autoplay"

import { Card } from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import CarouselItem from "@/components/CarouselItem"
import { Skeleton } from "@/components/ui/skeleton"

import { TmdbHookReturn, MediaList } from "@/types/tmdbApi"

interface CarouselSectionProps {
  useFetch: () => TmdbHookReturn<MediaList>;
  type: 'movie' | 'tv';
}

export default function CarouselSection({ useFetch, type }: CarouselSectionProps) {
  const { data } = useFetch();

  const plugin = React.useRef(
    Autoplay({ delay: 6000, stopOnInteraction: true })
  )

  const carouselLength = 5;

  if (!data) return (
    <Skeleton className="w-full h-100" />
  )
  else return (
    <Carousel
      plugins={[plugin.current]}
      opts={{
        loop: true,
        align: "center",
      }}
      className="w-full"
      onMouseEnter={plugin.current.stop}
      onMouseLeave={plugin.current.reset}
    >
      <CarouselContent>
        {data.results.slice(0, carouselLength).map((item) => (
          <CarouselItem key={item.id} data={item} type={type} />
        ))}
      </CarouselContent>
      <CarouselPrevious className="left-4" />
      <CarouselNext className="right-4" />
    </Carousel>
  )
}
