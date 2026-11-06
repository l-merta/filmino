"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { UserPlus } from "lucide-react";

import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { apiGet, apiPost } from "@/lib/apiClient";
import { errorMessage, type PublicUser } from "@/lib/collections";

type LinkInfo = {
  purpose: "COLLECTION_VIEW" | "COLLECTION_INVITE" | "PROFILE_VIEW";
  collection: { id: string; name: string; owner: PublicUser } | null;
  profileUser: PublicUser | null;
  createdBy: PublicUser;
  alreadyContributor: boolean;
};

/**
 * /s/:token — every share link lands here.
 * Read-only links redirect to the collection / profile with the token attached;
 * invite links ask the visitor to accept.
 */
export default function Sdileni({ token }: { token: string }) {
  const router = useRouter();
  const { status } = useSession() ?? {};
  const [info, setInfo] = useState<LinkInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (status === "loading") return;
    apiGet<LinkInfo>(`/share/${token}`)
      .then((l) => {
        const t = encodeURIComponent(token);
        if (l.purpose === "COLLECTION_VIEW" && l.collection) return router.replace(`/kolekce/${l.collection.id}?share=${t}`);
        if (l.purpose === "PROFILE_VIEW" && l.profileUser) return router.replace(`/uzivatel/${l.profileUser.id}?share=${t}`);
        if (l.purpose === "COLLECTION_INVITE" && l.alreadyContributor && l.collection) return router.replace(`/kolekce/${l.collection.id}`);
        setInfo(l);
      })
      .catch((e) => setError(errorMessage(e, "Odkaz je neplatný nebo vypršel")));
  }, [token, router, status]);

  const accept = async () => {
    setBusy(true);
    try {
      const { collectionId } = await apiPost<{ collectionId: string }>(`/share/${token}`);
      router.push(`/kolekce/${collectionId}`);
    } catch (e) {
      setError(errorMessage(e));
      setBusy(false);
    }
  };

  return (
    <div className="page-filmy">
      <Header />
      <main className="main-container section-spacing items-center">
        <div className="max-w-120 w-full rounded-xl border p-6 flex flex-col gap-4 text-center">
          {error ? (
            <>
              <h1 className="text-2xl font-bold">Odkaz nefunguje</h1>
              <p className="opacity-75">{error}</p>
              <Link href="/filmy"><Button variant="outline">Zpět na Filmino</Button></Link>
            </>
          ) : !info ? (
            <p className="opacity-70">Otevírám odkaz…</p>
          ) : (
            <>
              <UserPlus className="mx-auto" size={36} />
              <h1 className="text-2xl font-bold">Pozvánka do kolekce</h1>
              <p className="opacity-80">
                <strong>{info.createdBy.username}</strong> vás zve, abyste přispívali do kolekce <strong>{info.collection?.name}</strong>.
              </p>
              {status === "authenticated" ? (
                <Button onClick={accept} disabled={busy}>Přijmout pozvánku</Button>
              ) : (
                <Link href={`/prihlaseni?callbackUrl=${encodeURIComponent(`/s/${token}`)}`}>
                  <Button className="w-full">Přihlaste se pro přijetí</Button>
                </Link>
              )}
              <p className="text-xs opacity-60">Pozvánku lze použít jen jednou.</p>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
