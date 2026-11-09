"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, Eye, Bookmark, FolderPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useItemStatus } from "@/hooks/useItemStatus";
import type { MediaRef, SystemKind } from "@/lib/collections";

import AddToCollectionDialog from "./AddToCollectionDialog";
import AddModeDialog from "./AddModeDialog";

export const SYSTEM_BUTTONS: { kind: SystemKind; label: string; activeLabel: string; icon: typeof Heart }[] = [
  { kind: "FAVORITES", label: "Oblíbené", activeLabel: "V oblíbených", icon: Heart },
  { kind: "WATCHED", label: "Zhlédnuto", activeLabel: "Zhlédnuto", icon: Eye },
  { kind: "WATCHLIST", label: "Chci vidět", activeLabel: "Chci vidět", icon: Bookmark },
];

interface Props {
  item: MediaRef | null;
  className?: string;
}

/** The row of buttons on a movie / show / season / episode / collection page. */
export default function MediaActions({ item, className }: Props) {
  const state = useItemStatus(item);
  const [dialogOpen, setDialogOpen] = useState(false);

  if (!item) return null;

  if (!state.loggedIn) {
    return (
      <div className={cn("flex flex-wrap items-center gap-2 relative z-5", className)}>
        <Link href="/prihlaseni">
          <Button variant="outline" className="button-outline">
            <Heart /> Přihlaste se a ukládejte do kolekcí
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-2 relative z-5", className)}>
      {SYSTEM_BUTTONS.map(({ kind, label, activeLabel, icon: Icon }) => {
        const active = !!state.status?.system[kind]?.contains;
        return (
          <Button
            key={kind}
            variant="outline"
            className={cn("button-outline", active && "!border-[var(--color-main)] text-[var(--color-main)]")}
            disabled={!state.status}
            onClick={() => state.toggleSystem(kind)}
            aria-pressed={active}
          >
            <Icon className={cn(active && kind !== "WATCHED" && "fill-current")} />
            <span>{active ? activeLabel : label}</span>
          </Button>
        );
      })}
      <Button variant="outline" className="button-outline" disabled={!state.status} onClick={() => setDialogOpen(true)}>
        <FolderPlus />
        <span>Přidat do kolekce</span>
      </Button>
      {state.notice && !dialogOpen && <span className="text-sm opacity-75">{state.notice}</span>}
      <AddToCollectionDialog open={dialogOpen} onClose={() => setDialogOpen(false)} title={item.title} state={state} />
      <AddModeDialog state={state} title={item.title} />
    </div>
  );
}
