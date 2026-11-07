import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { handle, requireUserId, HttpError } from "@/lib/server/http";
import { requireCollectionAccess } from "@/lib/server/collections";

type Ctx = { params: Promise<{ id: string; userId: string }> };

/**
 * DELETE /api/v1/collections/:id/contributors/:userId
 * The owner can remove a contributor; a contributor can remove themselves (leave).
 */
export const DELETE = handle(async (_req: NextRequest, { params }: Ctx) => {
  const { id, userId: targetId } = await params;
  const userId = await requireUserId();
  const access = await requireCollectionAccess(id, userId, "edit");

  if (targetId === access.collection.ownerId) throw new HttpError(400, "Vlastníka nelze odebrat");
  if (!access.isOwner && targetId !== userId) throw new HttpError(403, "Přispěvatele může odebrat jen vlastník");

  await prisma.collectionContributor.deleteMany({ where: { collectionId: id, userId: targetId } });
  return NextResponse.json({ ok: true });
});
