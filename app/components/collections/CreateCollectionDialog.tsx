"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { collectionsApi, errorMessage } from "@/lib/collections";

export type NewCollectionDetails = { name: string; description: string; isPublic: boolean; showInLists: boolean };

interface Props {
  open: boolean;
  onClose: () => void;
  /**
   * Called instead of the default behaviour (create + open the new collection).
   * Used by the "Přidat do kolekce" popup to create a collection with the item in it.
   * Return false to keep the dialog open (e.g. after an error).
   */
  onCreate?: (details: NewCollectionDetails) => Promise<boolean>;
  /** Shown under the title, e.g. "s filmem Fight Club" */
  subtitle?: string;
  /** Error coming from the parent's onCreate */
  externalError?: string | null;
}

/** Popup with the new collection's name, description and visibility. */
export default function CreateCollectionDialog({ open, onClose, onCreate, subtitle, externalError }: Props) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [organizational, setOrganizational] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Start with an empty form every time the popup opens
  useEffect(() => {
    if (!open) return;
    setName("");
    setDescription("");
    setIsPublic(false);
    setOrganizational(false);
    setError(null);
    setBusy(false);
  }, [open]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const details = { name: name.trim(), description: description.trim(), isPublic, showInLists: !organizational };
    try {
      if (onCreate) {
        if (await onCreate(details)) onClose();
        setBusy(false);
        return;
      }
      const c = await collectionsApi.create(details);
      router.push(`/kolekce/${c.id}`);
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={<>Nová kolekce{subtitle && <span className="block text-sm font-normal opacity-70 line-clamp-1">{subtitle}</span>}</>}
    >
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
        <Switch checked={isPublic} onChange={setIsPublic} label="Veřejná" description="Kdokoli ji uvidí na vašem profilu. Soukromou vidíte jen vy a lidé, se kterými ji sdílíte." />
        <Switch
          checked={organizational}
          onChange={setOrganizational}
          label="Organizační kolekce"
          description="Nezobrazí se v seznamech ani na profilu – slouží jen jako skupina uvnitř jiných kolekcí (např. výběr epizod)."
        />
        {(error || externalError) && <p className="text-sm text-destructive">{error || externalError}</p>}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>Zrušit</Button>
          <Button type="submit" disabled={busy || !name.trim()}>Vytvořit</Button>
        </div>
      </form>
    </Modal>
  );
}
