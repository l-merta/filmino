"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { WandSparkles } from "lucide-react";

import List from "@/sections/List";
import MediaList from "@/sections/MediaList";
import { recommendationsApi } from "@/lib/collections";

/**
 * "Pro vás" on the movies / shows page: recommendations from the collections the
 * user picked in Nastavení účtu. Not shown to visitors who aren't logged in.
 */
export default function ForYouList({ type }: { type: "movie" | "tv" }) {
  const { status } = useSession() ?? {};
  const [hasSources, setHasSources] = useState<boolean | null>(null);

  useEffect(() => {
    if (status !== "authenticated") return;
    recommendationsApi
      .sources()
      .then((r) => setHasSources(r.collectionIds.length > 0))
      .catch(() => setHasSources(false));
  }, [status]);

  if (status !== "authenticated" || hasSources === null) return null;

  const icon = <WandSparkles size={30} />;
  if (!hasSources) {
    return (
      <List header="Pro vás" icon={icon}>
        <p className="opacity-70">
          Doporučení podle vašich kolekcí. Vyberte, ze kterých kolekcí se mají brát, v{" "}
          <Link href="/nastaveni#pro-vas" className="underline">nastavení účtu</Link>.
        </p>
      </List>
    );
  }
  return (
    <MediaList
      header="Pro vás"
      icon={icon}
      type={type}
      fetchFunction={(params) => recommendationsApi.list(type, params)}
      fallback={
        <List header="Pro vás" icon={icon}>
          <p className="opacity-70">Ve vybraných kolekcích zatím nejsou žádné {type === "movie" ? "filmy" : "seriály"}, ze kterých by šlo doporučovat.</p>
        </List>
      }
    />
  );
}
