"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, GripVertical, Tv } from "lucide-react";

import { Button } from "@/components/ui/button";
import { tmdb } from "@/lib/useTmdb";
import { cn } from "@/lib/utils";
import { ITEM_TYPE_LABEL, type CollectionItem } from "@/lib/collections";

import { CollectionGrid } from "./CollectionTile";

interface Props {
  items: CollectionItem[];
  onSave: (keys: string[]) => Promise<void>;
  onCancel: () => void;
}

/**
 * "Edit order" mode of a collection.
 * Desktop: drag a card onto another card. Phones (no drag & drop): use the arrows.
 */
export default function ReorderItems({ items, onSave, onCancel }: Props) {
  const [order, setOrder] = useState(items);
  const [dragKey, setDragKey] = useState<string | null>(null);
  const [overKey, setOverKey] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const move = (from: number, to: number) => {
    if (to < 0 || to >= order.length || from === to) return;
    setOrder((o) => {
      const next = [...o];
      const [it] = next.splice(from, 1);
      next.splice(to, 0, it);
      return next;
    });
  };

  const drop = (targetKey: string) => {
    if (dragKey) move(order.findIndex((i) => i.itemKey === dragKey), order.findIndex((i) => i.itemKey === targetKey));
    setDragKey(null);
    setOverKey(null);
  };

  const save = async () => {
    setSaving(true);
    await onSave(order.map((i) => i.itemKey));
    setSaving(false);
  };

  const arrow = "flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white cursor-pointer disabled:opacity-30";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-3 rounded-lg border p-3">
        <p className="text-sm opacity-80 flex-1 min-w-60">Přetáhněte kartičky na nové místo, nebo použijte šipky. Pak pořadí uložte.</p>
        <Button variant="outline" onClick={onCancel} disabled={saving}>Zrušit</Button>
        <Button onClick={save} disabled={saving}>{saving ? "Ukládám…" : "Uložit pořadí"}</Button>
      </div>
      <CollectionGrid>
        {order.map((item, index) => (
          <div
            key={item.itemKey}
            draggable
            onDragStart={(e) => {
              setDragKey(item.itemKey);
              e.dataTransfer.effectAllowed = "move";
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setOverKey(item.itemKey);
            }}
            onDragLeave={() => setOverKey((k) => (k === item.itemKey ? null : k))}
            onDrop={(e) => {
              e.preventDefault();
              drop(item.itemKey);
            }}
            onDragEnd={() => {
              setDragKey(null);
              setOverKey(null);
            }}
            className={cn(
              "flex flex-col gap-1 cursor-grab active:cursor-grabbing rounded-md transition",
              dragKey === item.itemKey && "opacity-40",
              overKey === item.itemKey && dragKey !== item.itemKey && "ring-2 ring-[var(--color-main)]"
            )}
          >
            <div className="w-full aspect-[2/3] relative flex items-center justify-center rounded-md overflow-hidden bg-[var(--background)]">
              {item.posterPath && (
                <Image src={tmdb.image(item.posterPath)} alt={item.title} width={300} height={450} className="w-full h-full object-cover absolute" draggable={false} />
              )}
              {!item.posterPath && <Tv size={40} className="opacity-70" />}
              <span className="absolute top-2 left-2 rounded-full bg-black/60 px-2 py-0.5 text-xs text-white">{index + 1}</span>
              <GripVertical className="absolute top-2 right-2 text-white drop-shadow" size={20} />
              <div className="absolute bottom-2 inset-x-2 flex justify-between">
                <button type="button" className={arrow} onClick={() => move(index, index - 1)} disabled={index === 0} aria-label="Posunout dopředu">
                  <ChevronLeft size={18} />
                </button>
                <button type="button" className={arrow} onClick={() => move(index, index + 1)} disabled={index === order.length - 1} aria-label="Posunout dozadu">
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
            <span className="font-bold line-clamp-1">{item.title}</span>
            <span className="text-sm opacity-60">{ITEM_TYPE_LABEL[item.type] ?? item.type}</span>
          </div>
        ))}
      </CollectionGrid>
    </div>
  );
}
