import Link from "next/link";
import Image from "next/image";
import { tmdb } from "@/lib/useTmdb";

import { Skeleton } from "./ui/skeleton";

import { MediaDetails, CollectionDetails } from "@/types/tmdbApi";

import { Tv } from "lucide-react";

import ActionMenu from "@/components/collections/ActionMenu";
import LibraryBadges from "@/components/collections/LibraryBadges";

interface CardProps {
  type?: "movie" | "tv";
  details?: MediaDetails;
  collectionDetails?: CollectionDetails;
}

export function SkeletonCard() {
  return (
    <div className="flex flex-col gap-2">
      <Skeleton className="w-full aspect-[2/3]" />
      <Skeleton className="w-full h-5" />
      <Skeleton className="w-30 h-5" />
    </div>
  );
}

export function MovieCard({ details }: CardProps) {
  if (details) return (
    <div className="relative group">
    <ActionMenu
      className="absolute top-2 right-2 z-10"
      item={{ type: "movie", tmdbId: details.id, title: details.title || details.original_title, posterPath: details.poster_path, year: details.release_date?.split('-')[0] || null }}
    />
    <Link href={'/filmy/' + details.id} className="flex flex-col gap-0.5 hover:scale-98 transition-transform duration-200">
      <div className="w-full aspect-[2/3] relative flex items-center justify-center">
        <Image 
          src={tmdb.image(details.poster_path || details.backdrop_path || "")} 
          alt={details.title} 
          width={300} 
          height={450} 
          className="w-full h-full object-cover rounded-md absolute z-3"
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
        <Tv size={40} className="opacity-70 absolute z-2" />
        <Skeleton className="w-full h-full rounded-md absolute z-1" />
        <LibraryBadges mediaKey={"movie:" + details.id} className="absolute bottom-2 left-2 z-4" />
      </div>
      <span className="font-bold text-[1.0rem] mt-2 line-clamp-1">{details.original_title}</span>
      {details.original_title !== details.title && <span className="font-semibold text-[1.0rem] opacity-60 line-clamp-1">{details.title}</span>}
      <span className="font-semibold text-[1.0rem] opacity-60">{details.release_date?.split('-')[0]}</span>
      {/* <span className="font-semibold text-[1.0rem] opacity-60">[{details.id}]</span> */}
    </Link>
    </div>
  )
}

export function TvCard({ details }: CardProps) {
  if (details) return (
    <div className="relative group">
    <ActionMenu
      className="absolute top-2 right-2 z-10"
      item={{ type: "tv", tmdbId: details.id, title: details.name || details.original_name, posterPath: details.poster_path, year: details.first_air_date?.split('-')[0] || null }}
    />
    <Link href={'/serialy/' + details.id} className="flex flex-col gap-0.5 hover:scale-98 transition-transform duration-200">
      <div className="w-full aspect-[2/3] relative flex items-center justify-center">
        <Image 
          src={tmdb.image(details.poster_path || details.backdrop_path || "")} 
          alt={details.name} 
          width={300} 
          height={450} 
          className="w-full h-full object-cover rounded-md absolute z-3" 
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
        <Tv size={40} className="opacity-70 absolute z-2" />
        <Skeleton className="w-full h-full rounded-md absolute z-1" />
        <LibraryBadges mediaKey={"tv:" + details.id} className="absolute bottom-2 left-2 z-4" />
      </div>
      <span className="font-bold text-[1.0rem] mt-2 line-clamp-1">{details.original_name}</span>
      {details.original_name !== details.name && <span className="font-semibold text-[1.0rem] opacity-60 line-clamp-1">{details.name}</span>}
      <span className="font-semibold text-[1.0rem] opacity-60">{details.first_air_date?.split('-')[0]}{details.last_air_date && (" - " + details.last_air_date.split('-')[0])}</span>
      {/* <span className="font-semibold text-[1.0rem] opacity-60">[{details.id}]</span> */}
    </Link>
    </div>
  )
}

export function CollectionCard({ collectionDetails }: CardProps) {
  if (collectionDetails) return (
    <div className="relative group">
    <ActionMenu
      className="absolute top-2 right-2 z-10"
      item={{ type: "tmdb_collection", tmdbId: collectionDetails.id, title: collectionDetails.name, posterPath: collectionDetails.poster_path }}
    />
    <Link href={'/filmy/kolekce/' + collectionDetails.id} className="flex flex-col gap-0.5 hover:scale-98 transition-transform duration-200">
      <div className="w-full aspect-[2/3] relative flex items-center justify-center">
        <Image 
          src={tmdb.image(collectionDetails.poster_path || collectionDetails.backdrop_path || "")} 
          alt={collectionDetails.name} 
          width={300} 
          height={450} 
          className="w-full h-full object-cover rounded-md absolute z-3"
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
        <Tv size={40} className="opacity-70 absolute z-2" />
        <Skeleton className="w-full h-full rounded-md absolute z-1" />
        <LibraryBadges mediaKey={"tmdb_collection:" + collectionDetails.id} className="absolute bottom-2 left-2 z-4" />
      </div>
      <span className="font-bold text-[1.0rem] mt-2 line-clamp-1">{collectionDetails.name}</span>
    </Link>
    </div>
  )
}

export default function Card({ type, details, collectionDetails }: CardProps) {
  if (!details && !collectionDetails) return <SkeletonCard />
  if (!details && collectionDetails) return <CollectionCard collectionDetails={collectionDetails} />
  if (type == 'movie') return <MovieCard details={details} />
  if (type == 'tv') return <TvCard details={details} />
}