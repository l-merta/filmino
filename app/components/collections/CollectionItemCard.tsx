"use client";

import Link from "next/link";
import Image from "next/image";
import { Folder, Trash2, Tv } from "lucide-react";

import { tmdb } from "@/lib/useTmdb";
import { ITEM_TYPE_LABEL, itemHref, type CollectionItem, type MediaRef } from "@/lib/collections";
import { Skeleton } from "@/components/ui/skeleton";

import ActionMenu, { type ExtraAction } from "./ActionMenu";
import LibraryBadges from "./LibraryBadges";
import { PosterMosaic } from "./CollectionTile";

interface Props {
  item: CollectionItem;
  onRemove?: () => void;
  share?: string | null;
}

/** Turns a stored item back into a MediaRef so the 3-dots menu can work with it. */
export function itemToRef(item: CollectionItem): MediaRef {
  return {
    type: item.type.toLowerCase() as MediaRef["type"],
    tmdbId: item.tmdbId ?? undefined,
    seasonNumber: item.seasonNumber ?? undefined,
    episodeNumber: item.episodeNumber ?? undefined,
    collectionId: item.childCollectionId ?? undefined,
    title: item.title,
    subtitle: item.subtitle,
    posterPath: item.posterPath,
    year: item.year,
  };
}

/**
 * "Star Wars: The Clone Wars · S01E02": a long show name gets cut off,
 * but the part after the last " · " (episode / season code) always stays visible.
 */
function Subtitle({ text }: { text: string }) {
  const cut = text.lastIndexOf(" · ");
  if (cut === -1) return <span className="font-semibold opacity-60 line-clamp-1">{text}</span>;
  return (
    <span className="font-semibold opacity-60 flex min-w-0" title={text}>
      <span className="truncate">{text.slice(0, cut)}</span>
      <span className="shrink-0 whitespace-pre">{text.slice(cut)}</span>
    </span>
  );
}

/** One item inside a user collection (movie, show, season, episode or nested collection). */
export default function CollectionItemCard({ item, onRemove, share }: Props) {
  let href = itemHref(item);
  // Pass the share token on, so nested private collections open too
  if (item.type === "COLLECTION" && share) href += `?share=${encodeURIComponent(share)}`;

  const extra: ExtraAction[] = onRemove
    ? [{ label: "Odebrat z kolekce", icon: <Trash2 size={16} />, onClick: onRemove, destructive: true }]
    : [];

  return (
    <div className="relative group">
      <ActionMenu className="absolute top-2 right-2 z-10" item={itemToRef(item)} extraActions={extra} />
      <Link href={href} className="flex flex-col gap-0.5 hover:scale-98 transition-transform duration-200">
        <div className="w-full aspect-[2/3] relative flex items-center justify-center">
          {item.type === "COLLECTION" && item.previewPosters && item.previewPosters.length > 0 ? (
            // Nested collection: show what's inside it, like on the profile
            <div className="w-full h-full rounded-md overflow-hidden absolute z-3">
              <PosterMosaic posters={item.previewPosters} />
            </div>
          ) : (
            item.posterPath && (
              <Image
                src={tmdb.image(item.posterPath)}
                alt={item.title}
                // Episode stills are landscape and get cropped to a portrait card,
                // so they need a much wider picture to stay sharp
                width={item.type === "EPISODE" ? 1280 : 400}
                height={item.type === "EPISODE" ? 720 : 600}
                sizes={item.type === "EPISODE" ? "(max-width: 640px) 100vw, 640px" : "(max-width: 640px) 50vw, 384px"}
                className="w-full h-full object-cover rounded-md absolute z-3"
                onError={(e) => { e.currentTarget.style.display = "none"; }}
              />
            )
          )}
          {item.type === "COLLECTION" ? <Folder size={40} className="opacity-70 absolute z-2" /> : <Tv size={40} className="opacity-70 absolute z-2" />}
          <Skeleton className="w-full h-full rounded-md absolute z-1" />
          <span className="absolute bottom-2 left-2 z-4 rounded-full bg-black/60 px-2 py-0.5 text-xs text-white">
            {ITEM_TYPE_LABEL[item.type] ?? item.type}
          </span>
          <LibraryBadges mediaKey={item.itemKey} className="absolute bottom-2 right-2 z-4" />
        </div>
        <span className="font-bold mt-2 line-clamp-1">{item.title}</span>
        {item.subtitle && <Subtitle text={item.subtitle} />}
        {item.year && <span className="font-semibold opacity-60">{item.year}</span>}
      </Link>
    </div>
  );
}
