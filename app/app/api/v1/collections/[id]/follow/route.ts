import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { handle, readJson, requireUserId, HttpError } from "@/lib/server/http";
import { requireCollectionAccess } from "@/lib/server/collections";

type Ctx = { params: Promise<{ id: string }> };

/**
 * POST /api/v1/collections/:id/follow   Body: { share?: token }
 * Follow a collection you can see (public, or via a read-only share link).
 */
export const POST = handle(async (req: NextRequest, { params }: Ctx) => {
  const { id } = await params;
  const userId = await requireUserId();
  const body = await readJson<{ share?: string }>(req).catch(() => ({} as { share?: string }));
  const access = await requireCollectionAccess(id, userId, "view", body.share ?? null);

  if (access.isContributor) throw new HttpError(400, "Svou vlastní kolekci nelze sledovat");

  await prisma.collectionFollow.upsert({
    where: { userId_collectionId: { userId, collectionId: id } },
    create: { userId, collectionId: id, shareLinkId: access.shareLinkId },
    update: access.shareLinkId ? { shareLinkId: access.shareLinkId } : {},
  });
  return NextResponse.json({ following: true });
});

/** DELETE /api/v1/collections/:id/follow — unfollow */
export const DELETE = handle(async (_req: NextRequest, { params }: Ctx) => {
  const { id } = await params;
  const userId = await requireUserId();
  await prisma.collectionFollow.deleteMany({ where: { userId, collectionId: id } });
  return NextResponse.json({ following: false });
});
