"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bookmark, Copy, Eye, GitFork, Globe, Heart, Lock, Settings, UserCheck, UserPlus, Users, EyeOff } from "lucide-react";

import Header from "@/components/Header";
import List from "@/sections/List";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import UserAvatar from "@/components/UserAvatar";
import MediaActions from "@/components/collections/MediaActions";
import CollectionItemCard from "@/components/collections/CollectionItemCard";
import { CollectionGrid } from "@/components/collections/CollectionTile";
import { cn } from "@/lib/utils";
import { collectionsApi, errorMessage, ITEM_TYPE_LABEL, plural, type CollectionDetail } from "@/lib/collections";

import ErrorPage from "./Error";

const SYSTEM_ICON = { FAVORITES: Heart, WATCHED: Eye, WATCHLIST: Bookmark };

/** /kolekce/:id — a user's collection */
export default function UzivatelskaKolekce({ id, share }: { id: string; share: string | null }) {
  const router = useRouter();
  const [data, setData] = useState<CollectionDetail | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("ALL");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      setData(await collectionsApi.get(id, share));
    } catch {
      setNotFound(true);
    }
  }, [id, share]);

  useEffect(() => {
    load();
  }, [load]);

  const types = useMemo(() => Array.from(new Set((data?.items ?? []).map((i) => i.type))), [data]);
  const items = useMemo(() => (data?.items ?? []).filter((i) => filter === "ALL" || i.type === filter), [data, filter]);

  if (notFound) {
    return <ErrorPage code={404} title="Kolekce nenalezena" message="Kolekce neexistuje, nebo k ní nemáte přístup." type="movie" />;
  }

  const run = async (fn: () => Promise<unknown>) => {
    setBusy(true);
    setError(null);
    try {
      await fn();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const toggleFollow = () =>
    run(async () => {
      if (!data) return;
      if (data.viewer.isFollowing) await collectionsApi.unfollow(id);
      else await collectionsApi.follow(id, share);
      await load();
    });

  const fork = () =>
    run(async () => {
      const { id: newId } = await collectionsApi.fork(id, share);
      router.push(`/kolekce/${newId}`);
    });

  const removeItem = (key: string) =>
    run(async () => {
      await collectionsApi.removeItem(id, key);
      setData((d) => d && { ...d, items: d.items.filter((i) => i.itemKey !== key), counts: { ...d.counts, items: d.counts.items - 1 } });
    });

  const SysIcon = data?.system ? SYSTEM_ICON[data.system] : null;

  return (
    <div className="page-filmy">
      <Header />
      <main className="main-container section-spacing">
        {!data ? (
          <div className="flex flex-col gap-4">
            <Skeleton className="w-80 max-w-full h-10" />
            <Skeleton className="w-60 h-5" />
            <Skeleton className="w-120 max-w-full h-4" />
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center gap-2 text-sm opacity-80">
                <span className="flex items-center gap-1 rounded-full border px-2 py-0.5">
                  {data.isPublic ? <Globe size={14} /> : <Lock size={14} />} {data.isPublic ? "Veřejná" : "Soukromá"}
                </span>
                {data.system && <span className="rounded-full border px-2 py-0.5">Výchozí kolekce</span>}
                {!data.showInLists && (
                  <span className="flex items-center gap-1 rounded-full border px-2 py-0.5" title="Nezobrazuje se v seznamech">
                    <EyeOff size={14} /> Organizační
                  </span>
                )}
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold flex items-center gap-3">
                {SysIcon && <SysIcon className="text-[var(--color-main)]" />}
                {data.name}
              </h1>
              <div className="flex flex-wrap items-center gap-2 opacity-85">
                <Link href={`/uzivatel/${data.owner.id}`} className="flex items-center gap-2 hover:opacity-70">
                  <UserAvatar user={data.owner} className="size-6" />
                  <span>{data.owner.username}</span>
                </Link>
                {data.forkedFrom && (
                  <span className="text-sm opacity-70">
                    · kopie kolekce{" "}
                    <Link href={`/kolekce/${data.forkedFrom.id}`} className="underline">{data.forkedFrom.name}</Link> ({data.forkedFrom.owner.username})
                  </span>
                )}
              </div>
              {data.description && <p className="opacity-85 max-w-160 whitespace-pre-line">{data.description}</p>}
              <div className="flex flex-wrap gap-4 text-sm opacity-80">
                <span>{plural(data.counts.items, "položka", "položky", "položek")}</span>
                <span className="flex items-center gap-1"><UserCheck size={14} /> {plural(data.counts.follows, "sledující", "sledující", "sledujících")}</span>
                <span className="flex items-center gap-1"><Eye size={14} /> {data.counts.watched}× zhlédnuto</span>
                <span className="flex items-center gap-1"><GitFork size={14} /> {plural(data.counts.forks, "kopie", "kopie", "kopií")}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {data.viewer.canEdit && (
                <Link href={`/kolekce/${id}/nastaveni`}>
                  <Button variant="outline" className="button-outline"><Settings /> Nastavení</Button>
                </Link>
              )}
              {data.viewer.loggedIn && !data.viewer.isContributor && (
                <Button variant="outline" className={cn("button-outline", data.viewer.isFollowing && "!border-[var(--color-main)]")} disabled={busy} onClick={toggleFollow}>
                  {data.viewer.isFollowing ? <UserCheck /> : <UserPlus />}
                  {data.viewer.isFollowing ? "Sledujete" : "Sledovat"}
                </Button>
              )}
              {data.viewer.loggedIn && (
                <Button variant="outline" className="button-outline" disabled={busy} onClick={fork} title="Vytvoří vaši vlastní kopii této kolekce">
                  <Copy /> Vytvořit kopii
                </Button>
              )}
              {!data.viewer.loggedIn && (
                <Link href="/prihlaseni"><Button variant="outline" className="button-outline">Přihlaste se pro sledování a kopírování</Button></Link>
              )}
            </div>
            {/* The collection itself can be favorited / watched / put in another collection */}
            {data.viewer.loggedIn && (
              <MediaActions item={{ type: "collection", collectionId: data.id, title: data.name, subtitle: data.owner.username, posterPath: data.items.find((i) => i.posterPath)?.posterPath ?? null }} />
            )}
            {error && <p className="text-destructive">{error}</p>}

            <div className="flex flex-wrap items-center gap-2">
              <Users size={16} className="opacity-70" />
              {data.contributors.map((c) => (
                <Link key={c.id} href={`/uzivatel/${c.id}`} className="flex items-center gap-1.5 rounded-full border pl-0.5 pr-3 py-0.5 hover:opacity-70">
                  <UserAvatar user={c} className="size-6" />
                  <span className="text-sm">{c.username}</span>
                  {c.role === "OWNER" && <span className="text-xs opacity-60">vlastník</span>}
                </Link>
              ))}
            </div>
          </div>
        )}

        {data && (
          <List header="Obsah">
            {types.length > 1 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {["ALL", ...types].map((t) => (
                  <Button key={t} size="sm" variant={filter === t ? "default" : "outline"} className={filter !== t ? "button-outline" : ""} onClick={() => setFilter(t)}>
                    {t === "ALL" ? "Vše" : ITEM_TYPE_LABEL[t] ?? t}
                  </Button>
                ))}
              </div>
            )}
            {items.length === 0 ? (
              <p className="opacity-70">
                Kolekce je prázdná. {data.viewer.canEdit && "Přidávejte filmy a seriály tlačítkem „Přidat do kolekce“ nebo přes ⋮ na kartičkách."}
              </p>
            ) : (
              <CollectionGrid>
                {items.map((item) => (
                  <CollectionItemCard
                    key={item.id}
                    item={item}
                    share={share}
                    onRemove={data.viewer.canEdit ? () => removeItem(item.itemKey) : undefined}
                  />
                ))}
              </CollectionGrid>
            )}
          </List>
        )}
      </main>
    </div>
  );
}
