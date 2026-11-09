// Collection items keep the poster that was shown when they were added, so the
// stored one can be in any language. Before sending items out we swap in the
// poster in the viewer's image language (looked up on TMDB, cached in memory).
import { axiosInstance } from "@/lib/axios";
import { getLanguagePrefs, type LanguagePref } from "./languagePrefs";
import { tmdbLanguage } from "./tmdbLocalize";

type PosterItem = { type: string; tmdbId: number | null; seasonNumber: number | null; posterPath: string | null };

const DAY = 24 * 60 * 60 * 1000;
const MAX_ENTRIES = 5000;
const cache = new Map<string, { value: string | null; at: number }>();

const get = async <T,>(path: string, language: string) =>
  (await axiosInstance.get<T>(path, { params: { language }, timeout: 4000 })).data;

type TmdbThing = { poster_path?: string | null; original_language?: string; parts?: { original_language?: string }[] };

/** TMDB path for an item's details, or null for things without a TMDB poster (episodes, user collections). */
function pathOf(i: PosterItem): string | null {
  if (!i.tmdbId) return null;
  switch (i.type.toUpperCase()) {
    case "MOVIE":
      return `/movie/${i.tmdbId}`;
    case "TV":
      return `/tv/${i.tmdbId}`;
    case "SEASON":
      return `/tv/${i.tmdbId}/season/${i.seasonNumber ?? 0}`;
    case "TMDB_COLLECTION":
      return `/collection/${i.tmdbId}`;
    default:
      return null;
  }
}

async function lookup(i: PosterItem, path: string, pref: LanguagePref): Promise<string | null> {
  if (pref !== "original") return (await get<TmdbThing>(path, tmdbLanguage(pref))).poster_path ?? null;

  // "Original": find out the original language first (seasons ask their show)
  const infoPath = i.type.toUpperCase() === "SEASON" ? `/tv/${i.tmdbId}` : path;
  const info = await get<TmdbThing>(infoPath, "en-US");
  const original = info.original_language ?? info.parts?.[0]?.original_language ?? "en";
  if (infoPath === path && original === "en") return info.poster_path ?? null;
  return (await get<TmdbThing>(path, tmdbLanguage(original))).poster_path ?? null;
}

/** Replaces `posterPath` on the given items (in place). Items that fail keep their stored poster. */
export async function localizePosters(items: PosterItem[]): Promise<void> {
  const todo = items.filter((i) => pathOf(i));
  if (todo.length === 0) return;
  const { image: pref } = await getLanguagePrefs();

  const byKey = new Map<string, PosterItem[]>();
  for (const i of todo) {
    const key = `${pref}:${pathOf(i)}`;
    byKey.set(key, [...(byKey.get(key) ?? []), i]);
  }

  const keys = [...byKey.keys()];
  const apply = (key: string, value: string | null) => {
    if (value) for (const i of byKey.get(key)!) i.posterPath = value;
  };

  // A few requests at a time so a big collection doesn't flood TMDB
  let next = 0;
  const worker = async () => {
    while (next < keys.length) {
      const key = keys[next++];
      const hit = cache.get(key);
      if (hit && Date.now() - hit.at < DAY) {
        apply(key, hit.value);
        continue;
      }
      const item = byKey.get(key)![0];
      try {
        const value = await lookup(item, pathOf(item)!, pref);
        if (cache.size >= MAX_ENTRIES) cache.delete(cache.keys().next().value!);
        cache.set(key, { value, at: Date.now() });
        apply(key, value);
      } catch {
        // TMDB down or slow: keep the stored poster
      }
    }
  };
  await Promise.all(Array.from({ length: Math.min(6, keys.length) }, worker));
}
