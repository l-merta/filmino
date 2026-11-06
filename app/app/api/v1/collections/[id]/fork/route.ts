import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { handle, readJson, requireUserId } from "@/lib/server/http";
import { requireCollectionAccess } from "@/lib/server/collections";

type Ctx = { params: Promise<{ id: string }> };

/**
 * POST /api/v1/collections/:id/fork   Body: { share?: token }
 * Copies a collection (and its items) into a new private collection owned by you.
 */
export const POST = handle(async (req: NextRequest, { params }: Ctx) => {
  const { id } = await params;
  const userId = await requireUserId();
  const body = await readJson<{ share?: string }>(req).catch(() => ({} as { share?: string }));
  const access = await requireCollectionAccess(id, userId, "view", body.share ?? null);

  const source = await prisma.collection.findUniqueOrThrow({
    where: { id },
    include: { items: true, owner: { select: { username: true } } },
  });

  // Forking someone's "Favorites" gives a normal collection named after it
  const name = source.system ? `${source.name} (${source.owner.username})` : source.name;

  const fork = await prisma.collection.create({
    data: {
      name: name.slice(0, 100),
      description: source.description,
      isPublic: false,
      showInLists: true,
      ownerId: userId,
      forkedFromId: access.collection.id,
      contributors: { create: { userId, role: "OWNER" } },
      items: {
        create: source.items.map((i) => ({
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
      },
    },
  });

  return NextResponse.json({ id: fork.id }, { status: 201 });
});
