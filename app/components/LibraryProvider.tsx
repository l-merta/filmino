"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";

import { apiGet } from "@/lib/apiClient";

type Kind = "FAVORITES" | "WATCHED" | "WATCHLIST" | "CUSTOM";
type Library = Record<Kind, Set<string>>;
export type LibraryFlags = { favorite: boolean; watched: boolean; watchlist: boolean; custom: boolean };

const empty = (): Library => ({ FAVORITES: new Set(), WATCHED: new Set(), WATCHLIST: new Set(), CUSTOM: new Set() });

const LibraryContext = createContext<{ library: Library; refresh: () => void }>({ library: empty(), refresh: () => {} });

/**
 * Keeps one list of "what is in my collections" for the whole app,
 * so every card can show its little icons instantly.
 */
export function LibraryProvider({ children }: { children: React.ReactNode }) {
  const { status } = useSession() ?? {};
  const [library, setLibrary] = useState<Library>(empty);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(async () => {
    if (status !== "authenticated") {
      setLibrary(empty());
      return;
    }
    try {
      const data = await apiGet<Record<Kind, string[]>>("/me/library");
      setLibrary({
        FAVORITES: new Set(data.FAVORITES),
        WATCHED: new Set(data.WATCHED),
        WATCHLIST: new Set(data.WATCHLIST),
        CUSTOM: new Set(data.CUSTOM),
      });
    } catch {
      // Not critical - the icons just won't show
    }
  }, [status]);

  useEffect(() => {
    load();
  }, [load]);

  // Several quick clicks -> one request
  const refresh = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(load, 300);
  }, [load]);

  const value = useMemo(() => ({ library, refresh }), [library, refresh]);
  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>;
}

export function useLibrary() {
  return useContext(LibraryContext);
}

/** Which of my collections contain this item key (e.g. "movie:550"). */
export function useLibraryFlags(key: string | null): LibraryFlags {
  const { library } = useLibrary();
  return {
    favorite: !!key && library.FAVORITES.has(key),
    watched: !!key && library.WATCHED.has(key),
    watchlist: !!key && library.WATCHLIST.has(key),
    custom: !!key && library.CUSTOM.has(key),
  };
}
