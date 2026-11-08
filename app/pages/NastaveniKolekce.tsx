"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowLeft, LogOut, Trash2, X } from "lucide-react";

import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import UserAvatar from "@/components/UserAvatar";
import ShareLinksManager from "@/components/collections/ShareLinksManager";
import { collectionsApi, errorMessage, type CollectionDetail } from "@/lib/collections";

import ErrorPage from "./Error";

function Card({ title, children, description }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border p-5 flex flex-col gap-4">
      <div>
        <h2 className="font-bold text-xl">{title}</h2>
        {description && <p className="text-sm opacity-70 mt-1">{description}</p>}
      </div>
      {children}
    </section>
  );
}

/** /kolekce/:id/nastaveni — name, visibility, share links, contributors */
export default function NastaveniKolekce({ id }: { id: string }) {
  const router = useRouter();
  const { data: session } = useSession() ?? {};
  const [data, setData] = useState<CollectionDetail | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const load = useCallback(async () => {
    try {
      const d = await collectionsApi.get(id);
      if (!d.viewer.canEdit) return setNotFound(true);
      setData(d);
      setName(d.name);
      setDescription(d.description ?? "");
    } catch {
      setNotFound(true);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const loadLinks = useCallback(() => collectionsApi.shareLinks(id), [id]);
  const createLink = useCallback((kind: "view" | "invite", label?: string) => collectionsApi.createShareLink(id, kind, label), [id]);

  if (notFound) return <ErrorPage code={404} title="Kolekce nenalezena" message="Kolekce neexistuje, nebo ji nemůžete upravovat." type="movie" />;
  if (!data) {
    return (
      <div className="page-filmy">
        <Header />
        <main className="main-container section-spacing"><p className="opacity-70">Načítám…</p></main>
      </div>
    );
  }

  const update = async (body: Parameters<typeof collectionsApi.update>[1], okText = "Uloženo") => {
    setMessage(null);
    try {
      await collectionsApi.update(id, body);
      setData((d) => d && { ...d, ...body } as CollectionDetail);
      setMessage({ type: "ok", text: okText });
    } catch (err) {
      setMessage({ type: "error", text: errorMessage(err) });
    }
  };

  const removeContributor = async (userId: string) => {
    setMessage(null);
    try {
      await collectionsApi.removeContributor(id, userId);
      if (userId === session?.user.id) return router.push("/profil");
      setData((d) => d && { ...d, contributors: d.contributors.filter((c) => c.id !== userId) });
    } catch (err) {
      setMessage({ type: "error", text: errorMessage(err) });
    }
  };

  const deleteCollection = async () => {
    try {
      await collectionsApi.remove(id);
      router.push("/profil");
    } catch (err) {
      setMessage({ type: "error", text: errorMessage(err) });
    }
  };

  const isSystem = !!data.system;
  const isOwner = data.viewer.isOwner;

  return (
    <div className="page-filmy">
      <Header />
      <main className="main-container section-spacing !gap-6">
        <div className="max-w-180 w-full mx-auto flex flex-col gap-6">
          <Link href={`/kolekce/${id}`} className="flex items-center gap-2 opacity-70 hover:opacity-100 w-fit">
            <ArrowLeft size={16} /> Zpět na kolekci
          </Link>
          <h1 className="text-3xl font-bold">Nastavení kolekce</h1>
          {message && <p className={message.type === "ok" ? "text-sm opacity-80" : "text-sm text-destructive"}>{message.text}</p>}

          <Card title="Základní údaje" description={isSystem ? "Název výchozí kolekce nelze změnit." : undefined}>
            <form
              className="flex flex-col gap-3"
              onSubmit={(e) => {
                e.preventDefault();
                update(isSystem ? { description } : { name, description });
              }}
            >
              <Input value={name} onChange={(e) => setName(e.target.value)} disabled={isSystem} maxLength={100} placeholder="Název" />
              <textarea
                placeholder="Popis (nepovinný)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={2000}
                rows={3}
                className="dark:bg-input/30 border-input w-full rounded-md border bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px]"
              />
              <Button type="submit" className="w-fit">Uložit</Button>
            </form>
          </Card>

          <Card title="Viditelnost" description={!isOwner ? "Viditelnost může měnit jen vlastník." : undefined}>
            <Switch
              checked={data.isPublic}
              disabled={!isOwner}
              onChange={(v) => update({ isPublic: v }, v ? "Kolekce je nyní veřejná" : "Kolekce je nyní soukromá")}
              label="Veřejná kolekce"
              description="Veřejnou kolekci uvidí kdokoli na vašem profilu. Soukromou jen přispěvatelé a lidé s odkazem."
            />
            {!isSystem && (
              <Switch
                checked={!data.showInLists}
                disabled={!isOwner}
                onChange={(v) => update({ showInLists: !v })}
                label="Organizační kolekce"
                description="Skryje kolekci ze seznamů a profilu. Hodí se pro skupiny (např. vybrané epizody), které vkládáte do jiných kolekcí. Nemění, kdo ji může vidět."
              />
            )}
          </Card>

          <Card title="Pořadí položek">
            <Switch
              checked={data.addToEnd}
              onChange={(v) => update({ addToEnd: v }, v ? "Nové položky se přidají na konec" : "Nové položky se přidají na začátek")}
              label="Přidávat nové položky na konec"
              description="Ve výchozím stavu se nově přidané filmy a seriály zobrazí jako první. Zapněte, pokud je chcete řadit za ostatní (např. při sestavování seznamu podle pořadí sledování)."
            />
          </Card>

          <Card
            title="Sdílení"
            description={
              isSystem
                ? "Odkaz pro čtení umožní komukoli s odkazem kolekci zobrazit, sledovat ji nebo si ji zkopírovat. Smazáním odkazu přístup zrušíte."
                : "Odkaz pro čtení umožní kolekci zobrazit, sledovat a kopírovat. Pozvánka je jednorázová – kdo ji otevře, stane se přispěvatelem. Smazáním odkazu přístup zrušíte."
            }
          >
            <ShareLinksManager kinds={isSystem ? ["view"] : ["view", "invite"]} load={loadLinks} create={createLink} remove={collectionsApi.deleteShareLink} />
          </Card>

          {!isSystem && (
            <Card title="Přispěvatelé" description="Přispěvatelé mohou přidávat a odebírat položky a vytvářet odkazy.">
              <ul className="flex flex-col gap-2">
                {data.contributors.map((c) => (
                  <li key={c.id} className="flex items-center gap-3">
                    <UserAvatar user={c} className="size-8" />
                    <Link href={`/uzivatel/${c.id}`} className="flex-1 hover:opacity-70">{c.username}</Link>
                    {c.role === "OWNER" ? (
                      <span className="text-sm opacity-60">vlastník</span>
                    ) : isOwner ? (
                      <Button size="sm" variant="outline" className="button-outline" onClick={() => removeContributor(c.id)}><X /> Odebrat</Button>
                    ) : c.id === session?.user.id ? (
                      <Button size="sm" variant="outline" className="button-outline" onClick={() => removeContributor(c.id)}><LogOut /> Opustit</Button>
                    ) : null}
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {isOwner && !isSystem && (
            <Card title="Smazat kolekci" description="Smaže kolekci i všechny její odkazy. Tuto akci nelze vrátit.">
              {!confirmDelete ? (
                <Button variant="destructive" className="w-fit" onClick={() => setConfirmDelete(true)}><Trash2 /> Smazat kolekci</Button>
              ) : (
                <div className="flex flex-wrap gap-2">
                  <Button variant="destructive" onClick={deleteCollection}><Trash2 /> Opravdu smazat</Button>
                  <Button variant="outline" onClick={() => setConfirmDelete(false)}>Zrušit</Button>
                </div>
              )}
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
