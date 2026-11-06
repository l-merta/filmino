"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Lock, Globe, Plus, Users } from "lucide-react";

import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { useItemStatus } from "@/hooks/useItemStatus";

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  state: ReturnType<typeof useItemStatus>;
}

/** Popup: tick the custom collections an item should be in, or create a new one. */
export default function AddToCollectionDialog({ open, onClose, title, state }: Props) {
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);

  const submitNew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    const created = await state.createWithItem(newName.trim());
    setCreating(false);
    if (created) setNewName("");
  };

  return (
    <Modal open={open} onClose={onClose} title={<>Přidat do kolekce<span className="block text-sm font-normal opacity-70 line-clamp-1">{title}</span></>}>
      {state.loading && !state.status && <p className="text-sm opacity-70">Načítám…</p>}
      {state.status && (
        <div className="flex flex-col gap-1 mb-4">
          {state.status.collections.length === 0 && (
            <p className="text-sm opacity-70 mb-2">Zatím nemáte žádné vlastní kolekce. Vytvořte první níže.</p>
          )}
          {state.status.collections.map((c) => (
            <button
              key={c.id}
              onClick={() => state.toggle(c.id, c.contains)}
              className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-accent text-left cursor-pointer"
            >
              <span
                className={
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded border " +
                  (c.contains ? "bg-[var(--color-main,var(--primary))] border-transparent" : "")
                }
              >
                {c.contains && <Check size={14} />}
              </span>
              <span className="flex-1 line-clamp-1">{c.name}</span>
              <span className="flex items-center gap-1 opacity-60">
                {c.shared && <Users size={14} aria-label="Sdílená" />}
                {c.isPublic ? <Globe size={14} aria-label="Veřejná" /> : <Lock size={14} aria-label="Soukromá" />}
              </span>
            </button>
          ))}
        </div>
      )}
      <form onSubmit={submitNew} className="flex gap-2">
        <Input placeholder="Nová kolekce…" value={newName} onChange={(e) => setNewName(e.target.value)} maxLength={100} />
        <Button type="submit" disabled={creating || !newName.trim()}>
          <Plus /> Vytvořit
        </Button>
      </form>
      {state.error && <p className="text-sm text-destructive mt-3">{state.error}</p>}
      <Link href="/kolekce" className="block text-sm opacity-70 hover:opacity-100 mt-4" onClick={onClose}>
        Spravovat moje kolekce →
      </Link>
    </Modal>
  );
}
