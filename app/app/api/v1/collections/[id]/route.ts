import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/auth";
import { handle, readJson, requireUserId, HttpError } from "@/lib/server/http";
import {
  collectionSummaryInclude,
  countWatched,
  publicUserSelect,
  requireCollectionAccess,
  serializeCollectionSummary,
} from "@/lib/server/collections";

type Ctx = { params: Promise<{ id: string }> };

/**
 * GET /api/v1/collections/:id?share=<token>
 * Full collection: items, contributors, counts and what the viewer is allowed to do.
 */
export const GET = handle(async (req: NextRequest, { params }: Ctx) => {
  const { id } = await params;
  const viewerId = await getUserId();
  const share = req.nextUrl.searchParams.get("share");
  const access = await requireCollectionAccess(id, viewerId, "view", share);

  const [collection, followCount, forkCount, watchedCount, forkedFrom] = await Promise.all([
    prisma.collection.findUniqueOrThrow({
      where: { id },
      include: {
        owner: { select: publicUserSelect },
        contributors: { include: { user: { select: publicUserSelect } }, orderBy: { createdAt: "asc" } },
        items: {
          orderBy: [{ position: "asc" }, { createdAt: "desc" }],
          include: { addedBy: { select: publicUserSelect } },
        },
      },
    }),
    prisma.collectionFollow.count({ where: { collectionId: id } }),
    prisma.collection.count({ where: { forkedFromId: id } }),
    countWatched(id),
    access.collection.forkedFromId
      ? prisma.collection.findUnique({
          where: { id: access.collection.forkedFromId },
          select: { id: true, name: true, owner: { select: publicUserSelect } },
        })
      : null,
  ]);

  return NextResponse.json({
    id: collection.id,
    name: collection.name,
    description: collection.description,
    system: collection.system,
    isPublic: collection.isPublic,
    showInLists: collection.showInLists,
    addToEnd: collection.addToEnd,
    createdAt: collection.createdAt,
    updatedAt: collection.updatedAt,
    owner: collection.owner,
    forkedFrom,
    contributors: collection.contributors.map((c) => ({ ...c.user, role: c.role })),
    items: collection.items.map((i) => ({
      id: i.id,
      itemKey: i.itemKey,
      type: i.type,
      tmdbId: i.tmdbId,
      seasonNumber: i.seasonNumber,
      episodeNumber: i.episodeNumber,
      childCollectionId: i.childCollectionId,
      title: i.title,
      subtitle: i.subtitle,
      posterPath: i.posterPath,
      year: i.year,
      createdAt: i.createdAt,
      addedBy: i.addedBy,
    })),
    counts: { follows: followCount, forks: forkCount, watched: watchedCount, items: collection.items.length },
    viewer: {
      loggedIn: !!viewerId,
      canEdit: access.canEdit,
      isOwner: access.isOwner,
      isContributor: access.isContributor,
      isFollowing: access.isFollowing,
    },
  });
});

/**
 * PATCH /api/v1/collections/:id
 * Body: { name?, description?, isPublic?, showInLists?, addToEnd? }
 * Contributors can rename / describe and pick where new items go. Only the owner can change visibility.
 * System collections can't be renamed.
 */
export const PATCH = handle(async (req: NextRequest, { params }: Ctx) => {
  const { id } = await params;
  const userId = await requireUserId();
  const access = await requireCollectionAccess(id, userId, "edit");
  const body = await readJson<{ name?: string; description?: string | null; isPublic?: boolean; showInLists?: boolean; addToEnd?: boolean }>(req);

  const data: { name?: string; description?: string | null; isPublic?: boolean; showInLists?: boolean; addToEnd?: boolean } = {};

  if (body.name !== undefined) {
    if (access.collection.system) throw new HttpError(400, "Název výchozí kolekce nelze změnit");
    const name = body.name.trim();
    if (!name) throw new HttpError(400, "Zadejte název kolekce");
    if (name.length > 100) throw new HttpError(400, "Název je příliš dlouhý (max. 100 znaků)");
    data.name = name;
  }
  if (body.description !== undefined) {
    data.description = body.description?.trim().slice(0, 2000) || null;
  }
  if (body.addToEnd !== undefined) data.addToEnd = !!body.addToEnd;
  if (body.isPublic !== undefined || body.showInLists !== undefined) {
    if (!access.isOwner) throw new HttpError(403, "Viditelnost může měnit jen vlastník");
    if (body.isPublic !== undefined) data.isPublic = !!body.isPublic;
    if (body.showInLists !== undefined) {
      if (access.collection.system) throw new HttpError(400, "Výchozí kolekce nelze skrýt");
      data.showInLists = !!body.showInLists;
    }
  }

  const updated = await prisma.collection.update({ where: { id }, data, include: collectionSummaryInclude });
  return NextResponse.json(serializeCollectionSummary(updated));
});

/** DELETE /api/v1/collections/:id — owner only, system collections can't be deleted. */
export const DELETE = handle(async (_req: NextRequest, { params }: Ctx) => {
  const { id } = await params;
  const userId = await requireUserId();
  const access = await requireCollectionAccess(id, userId, "owner");
  if (access.collection.system) throw new HttpError(400, "Výchozí kolekci nelze smazat");

  await prisma.collection.delete({ where: { id } });
  return NextResponse.json({ ok: true });
});
