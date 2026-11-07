import Link from "next/link";
import Image from "next/image";
import { Bookmark, Eye, Folder, Globe, Heart, Lock, EyeOff } from "lucide-react";

import { tmdb } from "@/lib/useTmdb";
import type { CollectionSummary } from "@/lib/collections";
import LibraryBadges from "./LibraryBadges";

const SYSTEM_ICON = { FAVORITES: Heart, WATCHED: Eye, WATCHLIST: Bookmark };

interface Props {
  collection: CollectionSummary;
  showOwner?: boolean;
  share?: string | null;
}

/** Card for a user collection: a 2×2 poster mosaic + name and badges. */
export default function CollectionTile({ collection, showOwner, share }: Props) {
  const Icon = collection.system ? SYSTEM_ICON[collection.system] : Folder;
  const posters = collection.posters.slice(0, 4);
  const href = `/kolekce/${collection.id}` + (share ? `?share=${encodeURIComponent(share)}` : "");

  return (
    <Link href={href} className="flex flex-col gap-1 hover:scale-98 transition-transform duration-200">
      <div className="w-full aspect-[2/3] rounded-md overflow-hidden bg-[var(--background)] border relative">
        {posters.length > 0 ? (
          <div className={"grid w-full h-full " + (posters.length > 1 ? "grid-cols-2 grid-rows-2" : "")}>
            {posters.map((p, i) => (
              <Image
                key={p + i}
                src={tmdb.image(p)}
                alt=""
                width={200}
                height={300}
                className={"w-full h-full object-cover " + (posters.length === 2 ? "row-span-2" : posters.length === 3 && i === 0 ? "row-span-2" : "")}
              />
            ))}
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center opacity-40">
            <Icon size={48} />
          </div>
        )}
        <div className="absolute top-2 left-2 flex gap-1">
          <span className="flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-xs text-white">
            <Icon size={12} /> {collection.itemCount ?? 0}
          </span>
        </div>
        <LibraryBadges mediaKey={`collection:${collection.id}`} className="absolute bottom-2 left-2" />
        <div className="absolute top-2 right-2 flex gap-1">
          {!collection.showInLists && (
            <span className="rounded-full bg-black/60 p-1 text-white" title="Organizační kolekce (skrytá v seznamech)">
              <EyeOff size={12} />
            </span>
          )}
          <span className="rounded-full bg-black/60 p-1 text-white" title={collection.isPublic ? "Veřejná" : "Soukromá"}>
            {collection.isPublic ? <Globe size={12} /> : <Lock size={12} />}
          </span>
        </div>
      </div>
      <span className="font-bold mt-1 line-clamp-1">{collection.name}</span>
      {showOwner && collection.owner && <span className="text-sm opacity-60 line-clamp-1">{collection.owner.username}</span>}
    </Link>
  );
}

export function CollectionGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 gap-y-8">{children}</div>;
}
