"use client";

import { Folder, ListPlus } from "lucide-react";

import { Modal } from "@/components/ui/modal";
import type { useItemStatus } from "@/hooks/useItemStatus";

const SYSTEM_NAMES: Record<string, string> = { FAVORITES: "Oblíbené", WATCHED: "Zhlédnuté", WATCHLIST: "Chci vidět" };

/**
 * Asked when a collection is being added into another collection:
 * nest the whole collection, or copy just the items inside it?
 */
export default function AddModeDialog({ state, title }: { state: ReturnType<typeof useItemStatus>; title: string }) {
  const p = state.pending;
  const target = p ? SYSTEM_NAMES[p.targetName] ?? p.targetName : "";
  const option = "w-full flex items-start gap-3 rounded-lg border p-4 text-left hover:bg-accent cursor-pointer";

  return (
    <Modal open={!!p} onClose={() => state.resolvePending(null)} title={`Přidat do „${target}“`}>
      <p className="text-sm opacity-75 mb-4">Jak chcete přidat kolekci „{title}“?</p>
      <div className="flex flex-col gap-2">
        <button className={option} onClick={() => state.resolvePending("whole")}>
          <Folder className="shrink-0 mt-0.5" size={20} />
          <span>
            <span className="block font-semibold">Celou kolekci</span>
            <span className="block text-sm opacity-70">Kolekce se vloží jako jedna položka a bude se dál aktualizovat.</span>
          </span>
        </button>
        <button className={option} onClick={() => state.resolvePending("contents")}>
          <ListPlus className="shrink-0 mt-0.5" size={20} />
          <span>
            <span className="block font-semibold">Jen její obsah</span>
            <span className="block text-sm opacity-70">Zkopírují se jednotlivé filmy, seriály a epizody, které teď kolekce obsahuje.</span>
          </span>
        </button>
      </div>
    </Modal>
  );
}
