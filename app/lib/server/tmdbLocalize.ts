// Mixes languages in TMDB responses, e.g. Czech texts with English posters.
//
// TMDB only has one `language` parameter, and it picks both the texts and the
// poster. So we ask for the texts' language first, then fetch the same thing
// again in the image language and copy just the image fields over (or the
// other way around for "original" texts).
import { axiosInstance } from "@/lib/axios";
import type { LanguagePref } from "./languagePrefs";

type Entity = Record<string, unknown> & { id?: number; media_type?: string; original_language?: string };
type Params = Record<string, string | number | boolean>;

export const TEXT_FIELDS = ["title", "name", "overview", "tagline"];
export const IMAGE_FIELDS = ["poster_path", "backdrop_path"];

/** "cs" -> "cs-CZ", "en" -> "en-US", anything else (e.g. "ja") stays as it is */
export function tmdbLanguage(code: string): string {
  return code === "cs" ? "cs-CZ" : code === "en" ? "en-US" : code;
}

const sameLanguage = (a: string, b: string) => a.split("-")[0] === b.split("-")[0];

/** Every movie / show / season / collection part in a response, with the language it should get. */
type Found = { entity: Entity; lang: string | undefined; kind?: string };

function collect(data: Entity, pref: LanguagePref | null): Found[] {
  const out: Found[] = [];
  const langFor = (e: Entity, fallback?: string) => (pref === "original" || pref === null ? e.original_language ?? fallback : pref);
  if (!data || typeof data !== "object") return out;

  // A TMDB collection has no original language of its own, use its first movie's
  const parts = data.parts as Entity[] | undefined;
  if (data.id !== undefined) out.push({ entity: data, lang: langFor(data, Array.isArray(parts) ? parts[0]?.original_language : undefined) });
  // Movie details: the "part of a collection" card
  const btc = data.belongs_to_collection as Entity | null | undefined;
  if (btc && typeof btc === "object") out.push({ entity: btc, lang: langFor(btc, data.original_language), kind: "collection" });
  // "cast" / "crew" are an actor's movies and shows (/person/:id/movie_credits etc.).
  // On a movie's own /credits they are people, who have no poster, so those are skipped.
  for (const key of ["results", "parts", "seasons", "cast", "crew"]) {
    const list = data[key];
    if (Array.isArray(list)) {
      const credits = key === "cast" || key === "crew";
      for (const e of list as Entity[]) {
        if (!e || typeof e !== "object") continue;
        if (credits && !("poster_path" in e)) continue;
        out.push({ entity: e, lang: langFor(e, data.original_language), kind: key === "seasons" ? "season" : undefined });
      }
    }
  }
  return out;
}

const keyOf = ({ entity: e, kind }: Found) => `${kind ?? e.media_type ?? ""}:${e.id}`;

/**
 * Re-fetches `path` in the language each item should have (`pref`) and copies `fields` over.
 * At most 3 extra TMDB requests (lists can mix many original languages).
 */
export async function patchLanguage(path: string, params: Params, data: Entity, pref: LanguagePref, baseLanguage: string, fields: string[]) {
  const groups = new Map<string, Found[]>();
  for (const found of collect(data, pref)) {
    if (!found.lang || sameLanguage(tmdbLanguage(found.lang), baseLanguage)) continue;
    const l = tmdbLanguage(found.lang);
    groups.set(l, [...(groups.get(l) ?? []), found]);
  }
  const biggest = [...groups.entries()].sort((a, b) => b[1].length - a[1].length).slice(0, 3);

  await Promise.all(
    biggest.map(async ([language, entities]) => {
      let other: Entity;
      try {
        other = (await axiosInstance.get(path, { params: { ...params, language } })).data;
      } catch {
        return; // keep what we have
      }
      // Match by kind + id (seasons and collections can't clash with a movie's id)
      const found = new Map<string, Entity>();
      for (const f of collect(other, null)) found.set(keyOf(f), f.entity);
      for (const f of entities) {
        const e = f.entity;
        const src = found.get(keyOf(f));
        if (!src) continue;
        for (const f of fields) {
          // TMDB returns "" when a translation is missing, keep the original then
          if (src[f]) e[f] = src[f];
        }
      }
    })
  );
}

type Image = { iso_639_1: string | null };

/**
 * For /images responses: put pictures in the wanted language first, because the
 * pages simply take the first poster / logo. Backdrops prefer pictures with no text.
 */
export function sortImages(data: Record<string, unknown>, lang: string) {
  const rank = (img: Image, order: (string | null)[]) => {
    const i = order.indexOf(img.iso_639_1);
    return i === -1 ? order.length : i;
  };
  const sortBy = (key: string, order: (string | null)[]) => {
    const list = data[key];
    if (Array.isArray(list)) data[key] = [...(list as Image[])].sort((a, b) => rank(a, order) - rank(b, order)); // stable: keeps TMDB's vote order inside a language
  };
  sortBy("posters", [lang, null]);
  sortBy("logos", [lang, null]);
  sortBy("backdrops", [null, lang]);
}
