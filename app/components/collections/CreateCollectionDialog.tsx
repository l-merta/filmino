"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { collectionsApi, errorMessage } from "@/lib/collections";

export default function CreateCollectionDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [organizational, setOrganizational] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const c = await collectionsApi.create({ name, description, isPublic, showInLists: !organizational });
      router.push(`/kolekce/${c.id}`);
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Nová kolekce">
      <form onSubmit={submit} className="flex flex-col gap-4">
        <Input placeholder="Název" value={name} onChange={(e) => setName(e.target.value)} maxLength={100} required autoFocus />
        <textarea
          placeholder="Popis (nepovinný)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={2000}
          rows={3}
          className="dark:bg-input/30 border-input w-full rounded-md border bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px]"
        />
        <Switch checked={isPublic} onChange={setIsPublic} label="Veřejná" description="Kdokoli ji uvidí na vašem profilu." />
        <Switch
          checked={organizational}
          onChange={setOrganizational}
          label="Organizační kolekce"
          description="Nezobrazí se v seznamech ani na profilu – slouží jen jako skupina uvnitř jiných kolekcí (např. výběr epizod)."
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" disabled={busy || !name.trim()}>Vytvořit</Button>
      </form>
    </Modal>
  );
}
