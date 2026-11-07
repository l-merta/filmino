"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, Copy, Link2, Trash2, UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { errorMessage, shareUrl, type ShareLinkInfo } from "@/lib/collections";

type Kind = "view" | "invite";

interface Props {
  load: () => Promise<ShareLinkInfo[]>;
  create: (kind: Kind, label?: string) => Promise<ShareLinkInfo>;
  remove: (id: string) => Promise<unknown>;
  /** Which kinds of links can be created here */
  kinds: Kind[];
}

const PURPOSE_LABEL: Record<ShareLinkInfo["purpose"], string> = {
  COLLECTION_VIEW: "Jen pro čtení",
  COLLECTION_INVITE: "Pozvánka pro přispěvatele (jednorázová)",
  PROFILE_VIEW: "Zobrazení profilu",
};

/** List / create / copy / delete share links. Used for collections and for the profile. */
export default function ShareLinksManager({ load, create, remove, kinds }: Props) {
  const [links, setLinks] = useState<ShareLinkInfo[] | null>(null);
  const [label, setLabel] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    try {
      setLinks(await load());
    } catch (err) {
      setError(errorMessage(err));
    }
  }, [load]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const onCreate = async (kind: Kind) => {
    setBusy(true);
    setError(null);
    try {
      const link = await create(kind, label || undefined);
      setLabel("");
      setLinks((l) => [link, ...(l ?? [])]);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const onDelete = async (id: string) => {
    setError(null);
    try {
      await remove(id);
      setLinks((l) => (l ?? []).filter((x) => x.id !== id));
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  const onCopy = async (token: string) => {
    try {
      await navigator.clipboard.writeText(shareUrl(token));
      setCopied(token);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      setError("Kopírování se nezdařilo, zkopírujte odkaz ručně.");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <Input placeholder="Popisek (nepovinný), např. „Pro rodinu“" value={label} onChange={(e) => setLabel(e.target.value)} maxLength={100} />
        {kinds.includes("view") && (
          <Button variant="outline" className="button-outline" disabled={busy} onClick={() => onCreate("view")}>
            <Link2 /> Odkaz pro čtení
          </Button>
        )}
        {kinds.includes("invite") && (
          <Button variant="outline" className="button-outline" disabled={busy} onClick={() => onCreate("invite")}>
            <UserPlus /> Pozvánka
          </Button>
        )}
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      {links === null ? (
        <p className="text-sm opacity-70">Načítám…</p>
      ) : links.length === 0 ? (
        <p className="text-sm opacity-70">Zatím žádné odkazy.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {links.map((l) => (
            <li key={l.id} className="flex flex-col sm:flex-row sm:items-center gap-2 rounded-md border p-3">
              <div className="flex-1 min-w-0">
                <div className="font-medium line-clamp-1">{l.label || PURPOSE_LABEL[l.purpose]}</div>
                <div className="text-xs opacity-60">
                  {PURPOSE_LABEL[l.purpose]}
                  {l.maxUses !== null && ` · použito ${l.uses}/${l.maxUses}`}
                  {!l.usable && " · neplatný"}
                  {l.createdBy && ` · vytvořil(a) ${l.createdBy.username}`}
                </div>
                <code className="block text-xs opacity-70 truncate mt-1">{shareUrl(l.token)}</code>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="button-outline" onClick={() => onCopy(l.token)} disabled={!l.usable}>
                  {copied === l.token ? <Check /> : <Copy />} {copied === l.token ? "Zkopírováno" : "Kopírovat"}
                </Button>
                <Button size="sm" variant="outline" className="button-outline" onClick={() => onDelete(l.id)} aria-label="Smazat odkaz">
                  <Trash2 />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
