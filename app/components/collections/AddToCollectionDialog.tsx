"use client";

import { useState } from "react";
import Link from "next/link";
import { Bookmark, Check, Eye, Folder, Globe, Heart, Lock, Plus, Users } from "lucide-react";

import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { SystemKind } from "@/lib/collections";
import type { useItemStatus } from "@/hooks/useItemStatus";

import CreateCollectionDialog from "./CreateCollectionDialog";

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  state: ReturnType<typeof useItemStatus>;
}

const SYSTEM_ROWS: { kind: SystemKind; name: string; icon: typeof Heart }[] = [
  { kind: "FAVORITES", name: "Oblíbené", icon: Heart },
  { kind: "WATCHED", name: "Zhlédnuté", icon: Eye },
  { kind: "WATCHLIST", name: "Chci vidět", icon: Bookmark },
];

/** One clickable row with a checkbox. */
function Row({ checked, onClick, icon, name, badges }: { checked: boolean; onClick: () => void; icon: React.ReactNode; name: string; badges?: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      role="checkbox"
      aria-checked={checked}
      className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-accent text-left cursor-pointer"
    >
      <span
        className={cn(
          "flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors",
          // Popups render outside the page, so fall back to the app's orange when --color-main isn't set
          checked ? "bg-[var(--color-main,var(--color-main-1))] border-transparent text-white" : "border-input"
        )}
      >
        {checked && <Check size={14} strokeWidth={3} />}
      </span>
      <span className="opacity-70 shrink-0">{icon}</span>
      <span className="flex-1 line-clamp-1">{name}</span>
      {badges && <span className="flex items-center gap-1 opacity-60">{badges}</span>}
    </button>
  );
}

/**
 * Popup: tick which collections an item should be in.
 * Default collections are always on top, then the rest ordered by last change.
 * "Nová kolekce" opens a second popup with the new collection's details.
 */
export default function AddToCollectionDialog({ open, onClose, title, state }: Props) {
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <>
      <Modal open={open && !createOpen} onClose={onClose} title={<>Přidat do kolekce<span className="block text-sm font-normal opacity-70 line-clamp-1">{title}</span></>}>
        {state.loading && !state.status && <p className="text-sm opacity-70">Načítám…</p>}
        {state.status && (
          <div className="flex flex-col gap-1 mb-4">
            {SYSTEM_ROWS.map(({ kind, name, icon: Icon }) => {
              const s = state.status!.system[kind];
              if (!s) return null;
              return <Row key={kind} checked={s.contains} onClick={() => state.toggle(s.id, s.contains)} icon={<Icon size={16} />} name={name} />;
            })}
            <div className="my-1 border-t" />
            {state.status.collections.length === 0 && (
              <p className="text-sm opacity-70 px-3 py-2">Zatím nemáte žádné vlastní kolekce.</p>
            )}
            {state.status.collections.map((c) => (
              <Row
                key={c.id}
                checked={c.contains}
                onClick={() => state.toggle(c.id, c.contains)}
                icon={<Folder size={16} />}
                name={c.name}
                badges={
                  <>
                    {c.shared && <Users size={14} aria-label="Sdílená" />}
                    {c.isPublic ? <Globe size={14} aria-label="Veřejná" /> : <Lock size={14} aria-label="Soukromá" />}
                  </>
                }
              />
            ))}
          </div>
        )}
        <Button variant="outline" className="w-full button-outline" onClick={() => setCreateOpen(true)}>
          <Plus /> Nová kolekce
        </Button>
        {state.error && <p className="text-sm text-destructive mt-3">{state.error}</p>}
        {state.notice && <p className="text-sm opacity-75 mt-3">{state.notice}</p>}
        <Link href="/profil" className="block text-sm opacity-70 hover:opacity-100 mt-4" onClick={onClose}>
          Spravovat moje kolekce →
        </Link>
      </Modal>
      <CreateCollectionDialog
        open={open && createOpen}
        onClose={() => setCreateOpen(false)}
        subtitle={`S položkou „${title}“`}
        externalError={state.error}
        onCreate={async (details) => {
          const res = await state.createWithItem({ name: details.name, description: details.description, isPublic: details.isPublic });
          return !!res;
        }}
      />
    </>
  );
}
