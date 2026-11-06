"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";

import { collectionsApi, errorMessage, itemKey, type ItemStatus, type MediaRef, type SystemKind } from "@/lib/collections";

/**
 * Loads + changes which of my collections contain one item.
 * Pass `enabled = false` to wait (e.g. until a menu is opened).
 */
export function useItemStatus(ref: MediaRef | null, enabled = true) {
  const { data: session } = useSession() ?? {};
  const loggedIn = !!session?.user;
  const key = ref ? itemKey(ref) : null;

  const [status, setStatus] = useState<ItemStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  /** Adds or removes the item from a collection, updating the UI right away. */
  const toggle = useCallback(
    async (collectionId: string, contains: boolean) => {
      if (!ref || !key) return;
      const apply = (value: boolean) =>
        setStatus((s) =>
          s && {
            system: Object.fromEntries(
              Object.entries(s.system).map(([k, v]) => [k, v && v.id === collectionId ? { ...v, contains: value } : v])
            ),
            collections: s.collections.map((c) => (c.id === collectionId ? { ...c, contains: value } : c)),
          }
        );
      apply(!contains); // optimistic
      try {
        if (contains) await collectionsApi.removeItem(collectionId, key);
        else await collectionsApi.addItem(collectionId, ref);
      } catch (err) {
        apply(contains); // undo
        setError(errorMessage(err));
      }
    },
    [ref, key]
  );

  const toggleSystem = useCallback(
    (kind: SystemKind) => {
      const s = status?.system[kind];
      if (s) return toggle(s.id, s.contains);
    },
    [status, toggle]
  );

  const createWithItem = useCallback(
    async (name: string) => {
      if (!ref) return;
      try {
        const created = await collectionsApi.create({ name, item: ref });
        setStatus((s) =>
          s && {
            ...s,
            collections: [
              { id: created.id, name: created.name, isPublic: created.isPublic, showInLists: created.showInLists, shared: false, contains: true },
              ...s.collections,
            ],
          }
        );
        return created;
      } catch (err) {
        setError(errorMessage(err));
      }
    },
    [ref]
  );

  return { loggedIn, status, loading, error, reload: load, toggle, toggleSystem, createWithItem };
}
