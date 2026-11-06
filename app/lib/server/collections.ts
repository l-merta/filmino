import type { Collection, CollectionItemType, Prisma, SystemCollection } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { HttpError } from "@/lib/server/http";
import { isShareLinkUsable } from "@/lib/server/shareLinks";

// ---------------------------------------------------------------------------
// System collections (Favorites / Watched / Watchlist)
// ---------------------------------------------------------------------------

export const SYSTEM_COLLECTIONS: { system: SystemCollection; name: string }[] = [
  { system: "FAVORITES", name: "Oblíbené" },
  { system: "WATCHED", name: "Zhlédnuté" },
  { system: "WATCHLIST", name: "Chci vidět" },
];

/**
 * Makes sure the user has their three default collections.
 * Called lazily (on the first request that needs them), so existing users get them too.
 */
export async function ensureSystemCollections(userId: string) {
  const existing = await prisma.collection.findMany({
    where: { ownerId: userId, system: { not: null } },
  });

  const missing = SYSTEM_COLLECTIONS.filter((s) => !existing.some((c) => c.system === s.system));

  for (const s of missing) {
    try {
      const created = await prisma.collection.create({
        data: {
          name: s.name,
          system: s.system,
          isPublic: true, // system collections are public by default
          ownerId: userId,
          contributors: { create: { userId, role: "OWNER" } },
        },
      });
      existing.push(created);
    } catch (err) {
      // Two requests raced to create it - the unique index stopped the duplicate.
      if ((err as { code?: string }).code !== "P2002") throw err;
    }
  }

  if (missing.length > 0) {
    return prisma.collection.findMany({ where: { ownerId: userId, system: { not: null } } });
  }
  return existing;
}

// ---------------------------------------------------------------------------
// Items
// ---------------------------------------------------------------------------

export type ItemInput = {
  type: "movie" | "tv" | "season" | "episode" | "collection" | "tmdb_collection";
  tmdbId?: number;
  seasonNumber?: number;
  episodeNumber?: number;
  collectionId?: string;
  title?: string;
  subtitle?: string | null;
  posterPath?: string | null;
  year?: string | null;
};

const TYPE_MAP: Record<ItemInput["type"], CollectionItemType> = {
  movie: "MOVIE",
  tv: "TV",
  season: "SEASON",
  episode: "EPISODE",
  collection: "COLLECTION",
  tmdb_collection: "TMDB_COLLECTION",
};

function isInt(n: unknown): n is number {
  return typeof n === "number" && Number.isInteger(n) && n >= 0;
}

/** Builds the unique key of an item, e.g. "episode:1399:2:5". Throws on invalid input. */
export function buildItemKey(input: Partial<ItemInput>): string {
  switch (input.type) {
    case "movie":
    case "tv":
    case "tmdb_collection":
      if (!isInt(input.tmdbId)) throw new HttpError(400, "Chybí tmdbId");
      return `${input.type}:${input.tmdbId}`;
    case "season":
      if (!isInt(input.tmdbId) || !isInt(input.seasonNumber)) throw new HttpError(400, "Chybí číslo série");
      return `season:${input.tmdbId}:${input.seasonNumber}`;
    case "episode":
      if (!isInt(input.tmdbId) || !isInt(input.seasonNumber) || !isInt(input.episodeNumber))
        throw new HttpError(400, "Chybí číslo epizody");
      return `episode:${input.tmdbId}:${input.seasonNumber}:${input.episodeNumber}`;
    case "collection":
      if (typeof input.collectionId !== "string" || !input.collectionId) throw new HttpError(400, "Chybí collectionId");
      return `collection:${input.collectionId}`;
    default:
      throw new HttpError(400, "Neznámý typ položky");
  }
}

function clip(value: unknown, max: number): string | null {
  if (typeof value !== "string" || value.length === 0) return null;
  return value.slice(0, max);
}

/** Turns client input into the data we store in CollectionItem. */
export function itemInputToData(input: ItemInput) {
  const itemKey = buildItemKey(input);
  return {
    itemKey,
    type: TYPE_MAP[input.type],
    tmdbId: input.type === "collection" ? null : input.tmdbId ?? null,
    seasonNumber: input.type === "season" || input.type === "episode" ? input.seasonNumber ?? null : null,
    episodeNumber: input.type === "episode" ? input.episodeNumber ?? null : null,
    childCollectionId: input.type === "collection" ? input.collectionId ?? null : null,
    title: clip(input.title, 255) ?? itemKey,
    subtitle: clip(input.subtitle, 255),
    posterPath: clip(input.posterPath, 255),
    year: clip(input.year, 32),
  };
}

/**
 * Returns true when `targetId` can be reached by walking into `startId`'s
 * nested collections. Used to stop loops like A ⊂ B ⊂ A.
 */
export async function containsCollection(startId: string, targetId: string, maxDepth = 10): Promise<boolean> {
  let frontier = [startId];
  const seen = new Set<string>(frontier);

  for (let depth = 0; depth < maxDepth && frontier.length > 0; depth++) {
    const children = await prisma.collectionItem.findMany({
      where: { collectionId: { in: frontier }, childCollectionId: { not: null } },
      select: { childCollectionId: true },
    });
    const next: string[] = [];
    for (const c of children) {
      const id = c.childCollectionId!;
      if (id === targetId) return true;
      if (!seen.has(id)) {
        seen.add(id);
        next.push(id);
      }
    }
    frontier = next;
  }
  return false;
}

// ---------------------------------------------------------------------------
// Permissions
// ---------------------------------------------------------------------------

export type CollectionAccess = {
  collection: Collection;
  canView: boolean;
  canEdit: boolean; // add / remove items, rename, manage share links
  isOwner: boolean;
  isContributor: boolean;
  isFollowing: boolean;
  /** The share link that granted access (if any), so a follow can remember it. */
  shareLinkId: string | null;
};

/**
 * Is a collection viewable via a share token, a follow, or because it is public?
 * Also checks parent collections: if you can see a collection, you can see the
 * (possibly organizational) collections nested inside it.
 */
async function canViewByRules(
  collection: Collection,
  viewerId: string | null,
  shareToken: string | null,
  depth: number,
  seen: Set<string>
): Promise<{ ok: boolean; shareLinkId: string | null }> {
  if (collection.isPublic) return { ok: true, shareLinkId: null };

  if (viewerId) {
    if (collection.ownerId === viewerId) return { ok: true, shareLinkId: null };
    const contributor = await prisma.collectionContributor.findUnique({
      where: { collectionId_userId: { collectionId: collection.id, userId: viewerId } },
    });
    if (contributor) return { ok: true, shareLinkId: null };

    // Followers keep access as long as the share link they used still works
    const follow = await prisma.collectionFollow.findUnique({
      where: { userId_collectionId: { userId: viewerId, collectionId: collection.id } },
      include: { shareLink: true },
    });
    if (follow && isShareLinkUsable(follow.shareLink)) return { ok: true, shareLinkId: follow.shareLinkId };
  }

  if (shareToken) {
    const link = await prisma.shareLink.findUnique({ where: { token: shareToken } });
    if (link && link.purpose === "COLLECTION_VIEW" && link.collectionId === collection.id && isShareLinkUsable(link)) {
      return { ok: true, shareLinkId: link.id };
    }
  }

  // Inherit access from parent collections (limited depth to stay cheap)
  if (depth < 4) {
    seen.add(collection.id);
    const parents = await prisma.collectionItem.findMany({
      where: { childCollectionId: collection.id },
      include: { collection: true },
      take: 50,
    });
    for (const p of parents) {
      if (seen.has(p.collection.id)) continue;
      const res = await canViewByRules(p.collection, viewerId, shareToken, depth + 1, seen);
      if (res.ok) return res;
    }
  }

  return { ok: false, shareLinkId: null };
}

export async function getCollectionAccess(
  collectionId: string,
  viewerId: string | null,
  shareToken: string | null = null
): Promise<CollectionAccess | null> {
  const collection = await prisma.collection.findUnique({ where: { id: collectionId } });
  if (!collection) return null;

  const isOwner = !!viewerId && collection.ownerId === viewerId;
  let isContributor = isOwner;
  let isFollowing = false;

  if (viewerId && !isOwner) {
    const [contributor, follow] = await Promise.all([
      prisma.collectionContributor.findUnique({
        where: { collectionId_userId: { collectionId, userId: viewerId } },
      }),
      prisma.collectionFollow.findUnique({
        where: { userId_collectionId: { userId: viewerId, collectionId } },
      }),
    ]);
    // System collections can never have other contributors
    isContributor = !!contributor && !collection.system;
    isFollowing = !!follow;
  }

  let canView = isContributor;
  let shareLinkId: string | null = null;
  if (!canView) {
    const res = await canViewByRules(collection, viewerId, shareToken, 0, new Set());
    canView = res.ok;
    shareLinkId = res.shareLinkId;
  }

  return {
    collection,
    canView,
    canEdit: isContributor,
    isOwner,
    isContributor,
    isFollowing,
    shareLinkId,
  };
}

/** Loads access and throws 404/403 so route handlers stay short. */
export async function requireCollectionAccess(
  collectionId: string,
  viewerId: string | null,
  need: "view" | "edit" | "owner",
  shareToken: string | null = null
): Promise<CollectionAccess> {
  const access = await getCollectionAccess(collectionId, viewerId, shareToken);
  if (!access || !access.canView) throw new HttpError(404, "Kolekce nenalezena");
  if (need === "edit" && !access.canEdit) throw new HttpError(403, "Nemáte oprávnění upravovat tuto kolekci");
  if (need === "owner" && !access.isOwner) throw new HttpError(403, "Tuto akci může provést jen vlastník kolekce");
  return access;
}

// ---------------------------------------------------------------------------
// Serialization
// ---------------------------------------------------------------------------

export const publicUserSelect = { id: true, username: true, image: true } satisfies Prisma.UsersSelect;

type CollectionWithPreview = Collection & {
  owner?: { id: string; username: string; image: string | null };
  items?: { posterPath: string | null }[];
  _count?: { items?: number; follows?: number; forks?: number };
};

/** Short form used in lists (profile, my collections, popups). */
export function serializeCollectionSummary(c: CollectionWithPreview) {
  return {
    id: c.id,
    name: c.name,
    description: c.description,
    system: c.system,
    isPublic: c.isPublic,
    showInLists: c.showInLists,
    ownerId: c.ownerId,
    owner: c.owner,
    forkedFromId: c.forkedFromId,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
    itemCount: c._count?.items ?? undefined,
    posters: (c.items ?? []).map((i) => i.posterPath).filter(Boolean),
  };
}

/** Prisma `include` for a collection summary with up to 4 preview posters. */
export const collectionSummaryInclude = {
  owner: { select: publicUserSelect },
  items: { select: { posterPath: true }, where: { posterPath: { not: null } }, orderBy: { createdAt: "desc" }, take: 4 },
  _count: { select: { items: true } },
} satisfies Prisma.CollectionInclude;

/**
 * Copies every item of `sourceId` into `targetId` (instead of nesting the collection itself).
 * Items already in the target are skipped, and so are nested collections that would create a loop.
 * Returns how many items were added.
 */
export async function addCollectionContents(sourceId: string, targetId: string, userId: string): Promise<number> {
  if (sourceId === targetId) throw new HttpError(400, "Kolekci nelze přidat samu do sebe");
  await requireCollectionAccess(sourceId, userId, "view");

  const items = await prisma.collectionItem.findMany({ where: { collectionId: sourceId }, orderBy: { createdAt: "asc" } });

  const safe = [];
  for (const i of items) {
    if (i.childCollectionId) {
      if (i.childCollectionId === targetId) continue;
      if (await containsCollection(i.childCollectionId, targetId)) continue;
    }
    safe.push(i);
  }

  const res = await prisma.collectionItem.createMany({
    data: safe.map((i) => ({
      collectionId: targetId,
      type: i.type,
      itemKey: i.itemKey,
      tmdbId: i.tmdbId,
      seasonNumber: i.seasonNumber,
      episodeNumber: i.episodeNumber,
      childCollectionId: i.childCollectionId,
      title: i.title,
      subtitle: i.subtitle,
      posterPath: i.posterPath,
      year: i.year,
      addedById: userId,
    })),
    skipDuplicates: true,
  });
  if (res.count > 0) await prisma.collection.update({ where: { id: targetId }, data: { updatedAt: new Date() } });
  return res.count;
}

/** Drops followed collections the user can no longer open (e.g. the share link was deleted). */
export async function filterAccessibleFollows<T extends { collectionId: string }>(userId: string, follows: T[]): Promise<T[]> {
  const ok = await Promise.all(follows.map(async (f) => (await getCollectionAccess(f.collectionId, userId))?.canView ?? false));
  return follows.filter((_, i) => ok[i]);
}

/** Count of how many users have this collection in their Watched collection. */
export async function countWatched(collectionId: string) {
  return prisma.collectionItem.count({
    where: { childCollectionId: collectionId, collection: { system: "WATCHED" } },
  });
}
