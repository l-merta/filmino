import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { handle, requireUserId, HttpError } from "@/lib/server/http";
import { getCollectionAccess } from "@/lib/server/collections";

type Ctx = { params: Promise<{ linkId: string }> };

/**
 * DELETE /api/v1/share-links/:linkId
 * Deleting a link revokes it immediately (anyone who followed through it loses access).
 * Allowed for: profile owner (profile links) or any contributor (collection links).
 */
export const DELETE = handle(async (_req: NextRequest, { params }: Ctx) => {
  const { linkId } = await params;
  const userId = await requireUserId();

  const link = await prisma.shareLink.findUnique({ where: { id: linkId } });
  if (!link) throw new HttpError(404, "Odkaz nenalezen");

  let allowed = link.createdById === userId || link.profileUserId === userId;
  if (!allowed && link.collectionId) {
    const access = await getCollectionAccess(link.collectionId, userId);
    allowed = !!access?.canEdit;
  }
  if (!allowed) throw new HttpError(403, "Nemáte oprávnění smazat tento odkaz");

  await prisma.shareLink.delete({ where: { id: linkId } });
  return NextResponse.json({ ok: true });
});
