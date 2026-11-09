"use client";

import { Bookmark, Eye, Folder, Heart } from "lucide-react";

import { cn } from "@/lib/utils";
import { itemKey, type MediaRef } from "@/lib/collections";
import { useLibraryFlags } from "@/components/LibraryProvider";

const BADGES = [
  { flag: "favorite", icon: Heart, label: "V oblíbených" },
  { flag: "watched", icon: Eye, label: "Zhlédnuto" },
  { flag: "watchlist", icon: Bookmark, label: "Chci vidět" },
  { flag: "custom", icon: Folder, label: "V některé z vašich kolekcí" },
] as const;

/**
 * Small icons on a card that show at a glance whether the item is in
 * my Favorites / Watched / Watchlist / one of my own collections.
 */
export default function LibraryBadges({ item, mediaKey, className }: { item?: MediaRef; mediaKey?: string; className?: string }) {
  const flags = useLibraryFlags(mediaKey ?? (item ? itemKey(item) : null));
  const active = BADGES.filter((b) => flags[b.flag]);
  if (active.length === 0) return null;

  return (
    <div className={cn("flex items-center gap-1 rounded-full bg-black/70 px-1.5 py-1 text-white pointer-events-auto", className)}>
      {active.map(({ flag, icon: Icon, label }) => (
        <span key={flag} title={label} aria-label={label} className="flex">
          <Icon size={14} className={flag === "favorite" || flag === "watchlist" ? "fill-current" : ""} />
        </span>
      ))}
    </div>
  );
}
