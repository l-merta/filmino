"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

import Header from "@/components/Header";
import List from "@/sections/List";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import CollectionTile, { CollectionGrid } from "@/components/collections/CollectionTile";
import CreateCollectionDialog from "@/components/collections/CreateCollectionDialog";
import { collectionsApi, errorMessage, type CollectionSummary } from "@/lib/collections";

type Mine = Awaited<ReturnType<typeof collectionsApi.mine>>;

function Section({ header, items, empty, showOwner }: { header: string; items: CollectionSummary[]; empty?: string; showOwner?: boolean }) {
  if (items.length === 0 && !empty) return null;
  return (
    <List header={header}>
      {items.length === 0 ? (
        <p className="opacity-70">{empty}</p>
      ) : (
        <CollectionGrid>
          {items.map((c) => <CollectionTile key={c.id} collection={c} showOwner={showOwner} />)}
        </CollectionGrid>
      )}
    </List>
  );
}

/** /kolekce — all collections of the logged in user */
export default function MojeKolekce() {
  const { status } = useSession() ?? {};
  const router = useRouter();
  const [data, setData] = useState<Mine | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/prihlaseni");
    if (status === "authenticated") collectionsApi.mine().then(setData).catch((e) => setError(errorMessage(e)));
  }, [status, router]);

  const visible = data?.owned.filter((c) => c.showInLists) ?? [];
  const hidden = data?.owned.filter((c) => !c.showInLists) ?? [];

  return (
    <div className="page-filmy">
      <Header />
      <main className="main-container section-spacing">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-3xl font-bold">Moje kolekce</h1>
          <Button onClick={() => setCreateOpen(true)}><Plus /> Nová kolekce</Button>
        </div>
        {error && <p className="text-destructive">{error}</p>}
        {!data ? (
          <CollectionGrid>
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="w-full aspect-[2/3]" />)}
          </CollectionGrid>
        ) : (
          <>
            <Section header="Výchozí" items={data.system} />
            <Section header="Vlastní kolekce" items={visible} empty="Zatím žádné vlastní kolekce." />
            <Section header="Organizační kolekce" items={hidden} />
            <Section header="Sdílené se mnou" items={data.contributed} showOwner />
            <Section header="Sledované" items={data.followed} showOwner empty="Nesledujete žádné kolekce." />
          </>
        )}
      </main>
      <CreateCollectionDialog open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
}
