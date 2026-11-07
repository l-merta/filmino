"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";

import { useLibrary } from "@/components/LibraryProvider";

import {
  collectionsApi,
  errorMessage,
  itemKey,
  plural,
  type AddMode,
  type CollectionSummary,
  type ItemStatus,
  type MediaRef,
  type SystemKind,
} from "@/lib/collections";

/** An add that waits for the user to pick "whole collection" or "just its contents". */
export type NewCollectionInput = { name: string; description?: string; isPublic?: boolean; showInLists?: boolean };
export type PendingAdd = { target: { collectionId: string } | { newCollection: NewCollectionInput }; targetName: string };

/**
 * Loads + changes which of my collections contain one item.
 * Pass `enabled = false` to wait (e.g. until a menu is opened).
 *
 * When the item is itself a collection, adding it first sets `pending`,
 * and the UI asks the user how to add it (see AddModeDialog).
 */
export function useItemStatus(ref: MediaRef | null, enabled = true) {
  const { data: session } = useSession() ?? {};
  const loggedIn = !!session?.user;
  const key = ref ? itemKey(ref) : null;
  // Both Filmino collections and TMDB movie collections can be added "whole" or "just the contents"
  const isCollection = ref?.type === "collection" || ref?.type === "tmdb_collection";

  const [status, setStatus] = useState<ItemStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, setPending] = useState<PendingAdd | null>(null);
  const { refresh: refreshLibrary } = useLibrary();

  const load = useCallback(async () => {
    if (!key || !loggedIn) return;
    setLoading(true);
    setError(null);
    try {
      setStatus(await collectionsApi.itemStatus(key));
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [key, loggedIn]);

  useEffect(() => {
    if (enabled) load();
  }, [enabled, load]);

  const setContains = useCallback(
    (collectionId: string, value: boolean) =>
      setStatus((s) =>
        s && {
          system: Object.fromEntries(
            Object.entries(s.system).map(([k, v]) => [k, v && v.id === collectionId ? { ...v, contains: value } : v])
          ),
          collections: s.collections.map((c) => (c.id === collectionId ? { ...c, contains: value } : c)),
        }
      ),
    []
  );

  const nameOf = useCallback(
    (collectionId: string) =>
      status?.collections.find((c) => c.id === collectionId)?.name ??
      Object.entries(status?.system ?? {}).find(([, v]) => v?.id === collectionId)?.[0] ??
      "kolekce",
    [status]
  );

  /** Adds `ref` to a collection with the chosen mode. */
  const add = useCallback(
    async (collectionId: string, mode: AddMode) => {
      if (!ref) return;
      setNotice(null);
      if (mode === "whole") setContains(collectionId, true); // optimistic
      try {
        const res = await collectionsApi.addItem(collectionId, ref, mode);
        if (mode === "contents") {
          const n = res?.added ?? 0;
          setNotice(n > 0 ? `Přidáno: ${plural(n, "položka", "položky", "položek")} z kolekce` : "Všechny položky už v kolekci jsou");
        }
        refreshLibrary();
      } catch (err) {
        if (mode === "whole") setContains(collectionId, false); // undo
        setError(errorMessage(err));
      }
    },
    [ref, setContains, refreshLibrary]
  );

  /** Adds or removes the item from a collection, updating the UI right away. */
  const toggle = useCallback(
    async (collectionId: string, contains: boolean) => {
      if (!ref || !key) return;
      if (!contains && isCollection) {
        // Ask first: the whole collection, or only what's inside it?
        setPending({ target: { collectionId }, targetName: nameOf(collectionId) });
        return;
      }
      if (!contains) return add(collectionId, "whole");
      setContains(collectionId, false);
      try {
        await collectionsApi.removeItem(collectionId, key);
        refreshLibrary();
      } catch (err) {
        setContains(collectionId, true);
        setError(errorMessage(err));
      }
    },
    [ref, key, isCollection, add, nameOf, setContains, refreshLibrary]
  );

  const toggleSystem = useCallback(
    (kind: SystemKind) => {
      const s = status?.system[kind];
      if (s) return toggle(s.id, s.contains);
    },
    [status, toggle]
  );

  const createAndAdd = useCallback(
    async (input: NewCollectionInput, mode: AddMode): Promise<CollectionSummary | undefined> => {
      if (!ref) return;
      try {
        const created = await collectionsApi.create(mode === "whole" ? { ...input, item: ref } : input);
        if (mode === "contents") await add(created.id, "contents");
        setStatus((s) =>
          s && {
            ...s,
            collections: [
              { id: created.id, name: created.name, isPublic: created.isPublic, showInLists: created.showInLists, shared: false, contains: mode === "whole" },
              ...s.collections,
            ],
          }
        );
        refreshLibrary();
        return created;
      } catch (err) {
        setError(errorMessage(err));
      }
    },
    [ref, add, refreshLibrary]
  );

  /** Creates a new collection containing this item (asks first when the item is a collection). */
  const createWithItem = useCallback(
    async (input: NewCollectionInput) => {
      setError(null);
      if (isCollection) {
        setPending({ target: { newCollection: input }, targetName: input.name });
        return { pending: true } as const;
      }
      return createAndAdd(input, "whole");
    },
    [isCollection, createAndAdd]
  );

  /** Called by AddModeDialog with the user's answer (null = cancel). */
  const resolvePending = useCallback(
    async (mode: AddMode | null) => {
      const p = pending;
      setPending(null);
      if (!p || !mode) return;
      if ("collectionId" in p.target) await add(p.target.collectionId, mode);
      else await createAndAdd(p.target.newCollection, mode);
    },
    [pending, add, createAndAdd]
  );

  return { loggedIn, status, loading, error, notice, pending, resolvePending, reload: load, toggle, toggleSystem, createWithItem };
}
