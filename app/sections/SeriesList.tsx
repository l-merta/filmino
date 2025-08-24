"use client";

import React from "react";

import List from "@/sections/List";
import SeriesCard from "@/components/SeriesCard";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

import { tmdb } from "@/hooks/useTmdb";

interface SeriesListProps {
  header: string;
  icon?: React.ReactNode;
  tvId: number;
}

export default function SeriesList({ header, icon, tvId }: SeriesListProps) {
  const { data, isLoading, error } = tmdb.tv.Details(Number(tvId));

  if (error) {
    return (
      <div className="z-4">
        <div className="flex items-center gap-3 mb-4 opacity-90">
          {icon}
          <h2 className="font-bold text-2xl">{header}</h2>
        </div>
        <div className="text-red-500">Error loading series: {error.message}</div>
      </div>
    );
  }

  return (
    <div className="z-4">
      <div className="flex items-center gap-3 mb-4 opacity-90">
        {icon}
        <h2 className="font-bold text-2xl">{header}</h2>
        <span className="font-thin text-2xl">{data?.number_of_seasons}</span>
      </div>
      <Carousel
        opts={{
          align: "start",
        }}
        className="w-full !items-start"
      >
        <CarouselContent className="w-full mt-14 -ml-2 md:-ml-4">
          {isLoading ? (
            // Loading skeletons
            Array.from({ length: 4 }).map((_, index) => (
              <CarouselItem key={`skeleton-${index}`} className="pl-2 md:pl-4 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6">
                <div className="p-1">
                  <SeriesCard tvId={tvId} />
                </div>
              </CarouselItem>
            ))
          ) : (
            // Actual series data
            data?.seasons?.slice(0, 20).map((series) => (
              <CarouselItem key={`series-${series.id}`} className="pl-2 md:pl-4 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6">
                <div className="p-1">
                  <SeriesCard details={series} tvId={tvId} />
                </div>
              </CarouselItem>
            ))
          )}
        </CarouselContent>
        <CarouselPrevious className="ml-12 !top-5 size-10" />
        <CarouselNext className="mr-12 !top-5 size-10" />
      </Carousel>
    </div>
  );
}