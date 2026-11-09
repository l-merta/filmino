// Which language a user wants TMDB texts and images in.
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/auth";

export const LANGUAGES = ["cs", "en", "original"] as const;
export type LanguagePref = (typeof LANGUAGES)[number];
export type LanguagePrefs = { text: LanguagePref; image: LanguagePref };

/** Used for visitors who aren't logged in (and as the default for new accounts). */
export const DEFAULT_PREFS: LanguagePrefs = { text: "cs", image: "en" };

export const isLanguagePref = (v: unknown): v is LanguagePref => typeof v === "string" && (LANGUAGES as readonly string[]).includes(v);

// The TMDB proxy runs on every page load, so keep prefs in memory for a minute
// instead of asking the database each time.
const cache = new Map<string, { prefs: LanguagePrefs; at: number }>();
const TTL = 60_000;

export function forgetLanguagePrefs(userId: string) {
  cache.delete(userId);
}

export async function getLanguagePrefs(): Promise<LanguagePrefs> {
  const userId = await getUserId().catch(() => null);
  if (!userId) return DEFAULT_PREFS;

  const hit = cache.get(userId);
  if (hit && Date.now() - hit.at < TTL) return hit.prefs;

  const user = await prisma.users.findUnique({ where: { id: userId }, select: { textLanguage: true, imageLanguage: true } });
  const prefs: LanguagePrefs = {
    text: isLanguagePref(user?.textLanguage) ? user.textLanguage : DEFAULT_PREFS.text,
    image: isLanguagePref(user?.imageLanguage) ? user.imageLanguage : DEFAULT_PREFS.image,
  };
  cache.set(userId, { prefs, at: Date.now() });
  return prefs;
}
