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
function collect(data: Entity, pref: LanguagePref | null): { entity: Entity; lang: string | undefined }[] {
  const out: { entity: Entity; lang: string | undefined }[] = [];
  const langFor = (e: Entity, fallback?: string) => (pref === "original" || pref === null ? e.original_language ?? fallback : pref);
  if (!data || typeof data !== "object") return out;

  if (data.id !== undefined) out.push({ entity: data, lang: langFor(data) });
  for (const key of ["results", "parts", "seasons"]) {
    const list = data[key];
    if (Array.isArray(list)) {
      for (const e of list as Entity[]) {
        if (e && typeof e === "object") out.push({ entity: e, lang: langFor(e, data.original_language) });
      }
    }
  }
  return out;
}

const keyOf = (e: Entity) => `${e.media_type ?? ""}:${e.id}`;

/**
 * Re-fetches `path` in the language each item should have (`pref`) and copies `fields` over.
 * At most 3 extra TMDB requests (lists can mix many original languages).
 */
export async function patchLanguage(path: string, params: Params, data: Entity, pref: LanguagePref, baseLanguage: string, fields: string[]) {
  const groups = new Map<string, Entity[]>();
  for (const { entity, lang } of collect(data, pref)) {
    if (!lang || sameLanguage(tmdbLanguage(lang), baseLanguage)) continue;
    const l = tmdbLanguage(lang);
    groups.set(l, [...(groups.get(l) ?? []), entity]);
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
      // Seasons are matched separately so a season id can't clash with a show id
      const found = new Map<string, Entity>();
      for (const { entity } of collect(other, null)) found.set(keyOf(entity), entity);
      for (const e of entities) {
        const src = found.get(keyOf(e));
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
