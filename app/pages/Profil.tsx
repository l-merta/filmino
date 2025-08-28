"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import Header from "@/components/Header";

export default function Profil() {
  const { data: session, status } = useSession() ?? {};
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return; // Still loading
    if (!session) {
      router.push("/prihlaseni");
      return;
    }
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <div className="page-filmy">
        <Header />
        <main className="main-container section-spacing">
          <div className="max-w-md w-full mx-auto space-y-4">
            <h1 className="text-3xl font-bold text-center mb-8">Profil</h1>
            <p className="text-center">Načítám...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!session) {
    return null; // Will redirect
  }

  return (
    <div className="page-filmy">
      <Header />
      <main className="main-container section-spacing">
        <div className="max-w-md w-full mx-auto space-y-4">
          <h1 className="text-3xl font-bold text-center mb-8">Profil</h1>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Uživatelské jméno:</p>
              <p className="font-medium">{session.user.username}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">E-mail:</p>
              <p className="font-medium">{session.user.email}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
