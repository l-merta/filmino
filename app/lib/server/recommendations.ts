// "Pro vás" (For you) and "Podobné" (Similar) lists built from collections.
//
// How it works, step by step:
//  1. Take every movie / show in the chosen collections (nested collections and
//     TMDB movie series are opened too, seasons and episodes count as their show).
//  2. Ask TMDB for each one's recommendations (or "similar" when TMDB has no
//     recommendations - the same as on a movie's page).
//  3. Merge everything, drop duplicates and things that are already in the collections.
//  4. Shuffle. Titles that several of your movies point to tend to end up near the
//     top. The shuffle only changes once per SHUFFLE_PERIOD, so the "+" button and
//     reloading the page keep the same order until then.
import { prisma } from "@/lib/prisma";
import { axiosInstance } from "@/lib/axios";
import { getLanguagePrefs } from "./languagePrefs";
import { localizePosters } from "./localPosters";
import { tmdbLanguage } from "./tmdbLocalize";

// ---------------------------------------------------------------------------
// Settings - change these to tune the feature
// ---------------------------------------------------------------------------

/**
 * How often the random order changes:
 *  "hour" | "day" | "week" - a new order every hour / day / week (Czech time)
 *  "never"                 - always the same order (until the collections change)
 */
export const SHUFFLE_PERIOD: ShufflePeriod = "day";

/** At most this many movies / shows are asked for recommendations (each one is a TMDB request). */
const MAX_SEEDS = 40;
/** Results per page - the lists on the site load 20 at a time. */
const PAGE_SIZE = 20;
/** TMDB answers are kept in memory this long. */
const CACHE_TTL = 24 * 60 * 60 * 1000;

export type ShufflePeriod = "hour" | "day" | "week" | "never";
export type MediaType = "movie" | "tv";

// ---------------------------------------------------------------------------
// Random numbers that are the same every time for the same "seed" text
// ---------------------------------------------------------------------------

/** Turns a text into a number (FNV-1a hash). */
function hash(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** A number between 0 and 1 that only depends on `text` (mulberry32). */
function random01(text: string): number {
  let t = (hash(text) + 0x6d2b79f5) | 0;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return (((t ^ (t >>> 14)) >>> 0) + 1) / 4294967297; // never exactly 0 or 1
}

/** Which "time slot" we are in, e.g. "2026-11-14" for daily shuffles. */
export function periodKey(period: ShufflePeriod = SHUFFLE_PERIOD, now = new Date()): string {
  if (period === "never") return "always-the-same";
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Prague", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", hourCycle: "h23" })
    .formatToParts(now)
    .reduce<Record<string, string>>((acc, p) => ({ ...acc, [p.type]: p.value }), {});
  const day = `${parts.year}-${parts.month}-${parts.day}`;
  if (period === "hour") return `${day}T${parts.hour}`;
  if (period === "week") return `week-${Math.floor(Date.UTC(+parts.year, +parts.month - 1, +parts.day) / (7 * 86400000))}`;
  return day;
}

// ---------------------------------------------------------------------------
// TMDB requests (cached)
// ---------------------------------------------------------------------------

const cache = new Map<string, { value: unknown; at: number }>();
const MAX_CACHE = 5000;

async function cachedGet<T>(path: string, params: Record<string, string | number | boolean>): Promise<T> {
  const key = path + "?" + JSON.stringify(params);
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < CACHE_TTL) return hit.value as T;
  const { data } = await axiosInstance.get<T>(path, { params, timeout: 6000 });
  if (cache.size >= MAX_CACHE) cache.delete(cache.keys().next().value!);
  cache.set(key, { value: data, at: Date.now() });
  return data;
}

type TmdbMedia = { id: number; poster_path?: string | null; popularity?: number; [key: string]: unknown };

/** Same as the movie / show page: recommendations first, "similar" when there are none. */
async function recommendationsOf(type: MediaType, id: number, language: string): Promise<TmdbMedia[]> {
  const params = { language, include_adult: false, page: 1 };
  try {
    const rec = await cachedGet<{ results?: TmdbMedia[] }>(`/${type}/${id}/recommendations`, params);
    if (rec.results?.length) return rec.results;
    const similar = await cachedGet<{ results?: TmdbMedia[] }>(`/${type}/${id}/similar`, params);
    return similar.results ?? [];
  } catch {
    return []; // one broken title shouldn't break the whole list
  }
}

// ---------------------------------------------------------------------------
// 1. What's inside the collections
// ---------------------------------------------------------------------------

export type Seeds = { movie: Set<number>; tv: Set<number> };

/**
 * All movies and shows inside the given collections, including nested collections
 * (access to nested ones is inherited from the parent, like on the collection page).
 */
export async function collectSeeds(collectionIds: string[], maxDepth = 5): Promise<Seeds> {
  const seeds: Seeds = { movie: new Set(), tv: new Set() };
  const tmdbCollections = new Set<number>();
  const seen = new Set<string>(collectionIds);
  let frontier = [...collectionIds];

  for (let depth = 0; depth <= maxDepth && frontier.length > 0; depth++) {
    const items = await prisma.collectionItem.findMany({
      where: { collectionId: { in: frontier } },
      select: { type: true, tmdbId: true, childCollectionId: true },
    });
    const next: string[] = [];
    for (const i of items) {
      if (i.type === "MOVIE" && i.tmdbId) seeds.movie.add(i.tmdbId);
      else if ((i.type === "TV" || i.type === "SEASON" || i.type === "EPISODE") && i.tmdbId) seeds.tv.add(i.tmdbId);
      else if (i.type === "TMDB_COLLECTION" && i.tmdbId) tmdbCollections.add(i.tmdbId);
      else if (i.type === "COLLECTION" && i.childCollectionId && !seen.has(i.childCollectionId)) {
        seen.add(i.childCollectionId);
        next.push(i.childCollectionId);
      }
    }
    frontier = next;
  }

  // A TMDB movie series (e.g. "Harry Potter") counts as all its movies
  await Promise.all(
    [...tmdbCollections].map(async (id) => {
      try {
        const data = await cachedGet<{ parts?: { id: number }[] }>(`/collection/${id}`, { language: "en-US" });
        for (const p of data.parts ?? []) seeds.movie.add(p.id);
      } catch {
        // skip
      }
    })
  );
  return seeds;
}

// ---------------------------------------------------------------------------
// 2.-4. Build one page of the list
// ---------------------------------------------------------------------------

export type RecommendationPage = {
  page: number;
  results: TmdbMedia[];
  total_pages: number;
  total_results: number;
};

/**
 * @param seeds     movies / shows to start from
 * @param type      "movie" or "tv" (TMDB recommends movies for movies and shows for shows)
 * @param scope     makes the shuffle different for each user / collection (e.g. "user:abc")
 * @param exclude   extra ids to leave out (e.g. what the user has already watched)
 */
export async function buildRecommendations(
  seeds: Seeds,
  type: MediaType,
  page: number,
  scope: string,
  exclude: Set<number> = new Set()
): Promise<RecommendationPage> {
  const shuffleSeed = `${scope}:${type}:${periodKey()}`;
  const prefs = await getLanguagePrefs();
  const language = prefs.text === "original" ? "en-US" : tmdbLanguage(prefs.text);

  // Too many titles? Take a random (but stable for this period) selection of them.
  const seedIds = [...seeds[type]]
    .map((id) => ({ id, r: random01(`${shuffleSeed}:seed:${id}`) }))
    .sort((a, b) => a.r - b.r)
    .slice(0, MAX_SEEDS)
    .map((s) => s.id);

  // Ask TMDB, a few requests at a time
  const lists: TmdbMedia[][] = [];
  let next = 0;
  const worker = async () => {
    while (next < seedIds.length) {
      const id = seedIds[next++];
      lists.push(await recommendationsOf(type, id, language));
    }
  };
  await Promise.all(Array.from({ length: Math.min(6, seedIds.length) }, worker));

  // Merge: remember each title once and count how many of your titles recommend it
  const merged = new Map<number, { item: TmdbMedia; count: number }>();
  for (const list of lists) {
    for (const item of list) {
      if (!item?.id || seeds[type].has(item.id) || exclude.has(item.id)) continue;
      const found = merged.get(item.id);
      if (found) found.count++;
      else merged.set(item.id, { item, count: 1 });
    }
  }

  // Weighted shuffle: random^(1/count) - a title recommended 3× usually beats one recommended once,
  // but not always, so the list still feels fresh.
  const ordered = [...merged.values()]
    .map((m) => ({ ...m, key: Math.pow(random01(`${shuffleSeed}:${m.item.id}`), 1 / m.count) }))
    .sort((a, b) => b.key - a.key)
    .map((m) => m.item);

  const total = ordered.length;
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const safePage = Math.max(1, Math.floor(page) || 1);
  const results = ordered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE).map((r) => ({ ...r }));

  // Posters in the user's image language (only for the 20 shown, cached for a day)
  if (prefs.image !== prefs.text) {
    const posterItems = results.map((r) => ({ type: type === "movie" ? "MOVIE" : "TV", tmdbId: r.id, seasonNumber: null, posterPath: r.poster_path ?? null }));
    await localizePosters(posterItems);
    posterItems.forEach((p, i) => (results[i].poster_path = p.posterPath));
  }

  return { page: safePage, results, total_pages: totalPages, total_results: total };
}

export const parseMediaType = (v: string | null): MediaType => (v === "tv" ? "tv" : "movie");
