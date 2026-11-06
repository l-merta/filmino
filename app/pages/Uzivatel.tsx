"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Check, Clock, Globe, Lock, Plus, Settings, UserCheck, UserPlus, X } from "lucide-react";

import Header from "@/components/Header";
import List from "@/sections/List";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import UserAvatar from "@/components/UserAvatar";
import CollectionTile, { CollectionGrid } from "@/components/collections/CollectionTile";
import CreateCollectionDialog from "@/components/collections/CreateCollectionDialog";
import { errorMessage, plural, usersApi, type CollectionSummary, type ProfileResponse, type PublicUser } from "@/lib/collections";

import ErrorPage from "./Error";

function Section({ header, items, showOwner, empty }: { header: string; items?: CollectionSummary[]; showOwner?: boolean; empty?: string }) {
  if (!items || items.length === 0) {
    if (!empty) return null;
    return <List header={header}><p className="opacity-70">{empty}</p></List>;
  }
  return (
    <List header={header}>
      <CollectionGrid>
        {items.map((c) => <CollectionTile key={c.id} collection={c} showOwner={showOwner} />)}
      </CollectionGrid>
    </List>
  );
}

/** Follow requests waiting for the profile owner (only shown on your own profile). */
function FollowRequests() {
  const [requests, setRequests] = useState<PublicUser[]>([]);

  useEffect(() => {
    usersApi.followRequests().then((r) => setRequests(r.requests)).catch(() => {});
  }, []);

  if (requests.length === 0) return null;

  const answer = async (userId: string, accept: boolean) => {
    if (accept) await usersApi.acceptFollower(userId);
    else await usersApi.removeFollower(userId);
    setRequests((r) => r.filter((u) => u.id !== userId));
  };

  return (
    <List header="Žádosti o sledování">
      <ul className="flex flex-col gap-2 max-w-120">
        {requests.map((u) => (
          <li key={u.id} className="flex items-center gap-3 rounded-md border p-2">
            <UserAvatar user={u} className="size-8" />
            <Link href={`/uzivatel/${u.id}`} className="flex-1 hover:opacity-70">{u.username}</Link>
            <Button size="sm" onClick={() => answer(u.id, true)}><Check /> Přijmout</Button>
            <Button size="sm" variant="outline" onClick={() => answer(u.id, false)} aria-label="Odmítnout"><X /></Button>
          </li>
        ))}
      </ul>
    </List>
  );
}

/** /uzivatel/:id (and /profil for yourself) */
export default function Uzivatel({ id, share }: { id?: string; share?: string | null }) {
  const { data: session, status } = useSession() ?? {};
  const router = useRouter();
  const userId = id ?? session?.user.id;

  const [data, setData] = useState<ProfileResponse | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const load = useCallback(async () => {
    if (!userId) return;
    try {
      setData(await usersApi.profile(userId, share));
    } catch {
      setNotFound(true);
    }
  }, [userId, share]);

  useEffect(() => {
    if (!id && status === "unauthenticated") router.push("/prihlaseni");
    load();
  }, [id, status, router, load]);

  if (notFound) return <ErrorPage code={404} title="Uživatel nenalezen" message="Tento uživatel neexistuje." type="movie" />;

  const follow = async () => {
    if (!data) return;
    setError(null);
    try {
      if (data.viewerFollow === "NONE") await usersApi.follow(data.user.id);
      else await usersApi.unfollow(data.user.id);
      await load();
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  const followLabel = { NONE: "Sledovat", PENDING: "Žádost odeslána", ACCEPTED: "Sledujete" } as const;
  const FollowIcon = { NONE: UserPlus, PENDING: Clock, ACCEPTED: UserCheck }[data?.viewerFollow ?? "NONE"];

  return (
    <div className="page-filmy">
      <Header />
      <main className="main-container section-spacing">
        {!data ? (
          <div className="flex items-center gap-4">
            <Skeleton className="size-20 rounded-full" />
            <div className="flex flex-col gap-2">
              <Skeleton className="w-48 h-8" />
              <Skeleton className="w-32 h-4" />
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <UserAvatar user={data.user} className="size-20 text-2xl" />
              <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold">{data.user.username}</h1>
                <div className="flex flex-wrap items-center gap-3 text-sm opacity-75">
                  <span className="flex items-center gap-1">
                    {data.user.isPublic ? <Globe size={14} /> : <Lock size={14} />}
                    {data.user.isPublic ? "Veřejný profil" : "Soukromý profil"}
                  </span>
                  <span>{plural(data.counts.followers, "sledující", "sledující", "sledujících")}</span>
                  <span>sleduje {data.counts.following}</span>
                </div>
              </div>
              <div className="flex gap-2 sm:ml-auto">
                {data.isSelf ? (
                  <>
                    <Button onClick={() => setCreateOpen(true)}><Plus /> Nová kolekce</Button>
                    <Link href="/nastaveni"><Button variant="outline" className="button-outline"><Settings /> Nastavení účtu</Button></Link>
                  </>
                ) : session?.user ? (
                  <Button variant={data.viewerFollow === "NONE" ? "default" : "outline"} onClick={follow}>
                    <FollowIcon /> {followLabel[data.viewerFollow]}
                  </Button>
                ) : (
                  <Link href="/prihlaseni"><Button variant="outline">Přihlaste se pro sledování</Button></Link>
                )}
              </div>
            </div>
            {error && <p className="text-destructive text-sm">{error}</p>}
          </div>
        )}

        {data && !data.canSeeContent && (
          <div className="rounded-xl border p-6 flex items-start gap-4 max-w-160">
            <Lock className="shrink-0 mt-1" />
            <div>
              <h2 className="font-bold text-xl">Tento účet je soukromý</h2>
              <p className="opacity-75 mt-1">
                {data.viewerFollow === "PENDING"
                  ? "Vaše žádost o sledování čeká na schválení."
                  : "Kolekce uvidíte, až vám uživatel schválí žádost o sledování."}
              </p>
            </div>
          </div>
        )}

        {data?.isSelf && <FollowRequests />}

        {data?.collections && (
          <>
            <Section header="Výchozí kolekce" items={data.collections.system} />
            <Section
              header={data.isSelf ? "Moje kolekce" : "Kolekce"}
              items={data.collections.owned}
              empty={data.isSelf ? "Zatím nemáte žádné vlastní kolekce. Vytvořte první tlačítkem „Nová kolekce“." : undefined}
            />
            <Section header={data.isSelf ? "Sdílené se mnou" : "Přispívá do"} items={data.collections.contributed} showOwner />
            {data.isSelf && <Section header="Organizační kolekce" items={data.collections.hidden} />}
            {data.isSelf && <Section header="Sledované kolekce" items={data.collections.followed} showOwner empty="Nesledujete žádné kolekce." />}
            {!data.isSelf &&
              data.collections.system.length + data.collections.owned.length + data.collections.contributed.length === 0 && (
                <p className="opacity-70">Uživatel zatím nemá žádné veřejné kolekce.</p>
              )}
          </>
        )}
      </main>
      {data?.isSelf && <CreateCollectionDialog open={createOpen} onClose={() => setCreateOpen(false)} />}
    </div>
  );
}
