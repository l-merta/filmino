import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/auth";
import { handle, requireUserId, HttpError } from "@/lib/server/http";
import { publicUserSelect } from "@/lib/server/collections";
import { isShareLinkUsable } from "@/lib/server/shareLinks";

type Ctx = { params: Promise<{ token: string }> };

async function findLink(token: string) {
  const link = await prisma.shareLink.findUnique({
    where: { token },
    include: {
      collection: { select: { id: true, name: true, system: true, owner: { select: publicUserSelect } } },
      profileUser: { select: publicUserSelect },
      createdBy: { select: publicUserSelect },
    },
  });
  if (!link || !isShareLinkUsable(link)) throw new HttpError(404, "Odkaz je neplatný nebo vypršel");
  return link;
}

/**
 * GET /api/v1/share/:token
 * Tells the /s/:token page what the link is for, so it can redirect or show an invite.
 */
export const GET = handle(async (_req: NextRequest, { params }: Ctx) => {
  const { token } = await params;
  const link = await findLink(token);
  const viewerId = await getUserId();

  let alreadyContributor = false;
  if (link.purpose === "COLLECTION_INVITE" && viewerId && link.collectionId) {
    alreadyContributor = !!(await prisma.collectionContributor.findUnique({
      where: { collectionId_userId: { collectionId: link.collectionId, userId: viewerId } },
    }));
  }

  return NextResponse.json({
    purpose: link.purpose,
    collection: link.collection,
    profileUser: link.profileUser,
    createdBy: link.createdBy,
    alreadyContributor,
  });
});

/**
 * POST /api/v1/share/:token — accept a contributor invite.
 * Uses up the link (invites are one-time) and adds you as a contributor.
 */
export const POST = handle(async (_req: NextRequest, { params }: Ctx) => {
  const { token } = await params;
  const userId = await requireUserId();
  const link = await findLink(token);

  if (link.purpose !== "COLLECTION_INVITE" || !link.collectionId || !link.collection) {
    throw new HttpError(400, "Tento odkaz není pozvánka");
  }
  if (link.collection.system) throw new HttpError(400, "Do výchozích kolekcí nelze přispívat");

  const existing = await prisma.collectionContributor.findUnique({
    where: { collectionId_userId: { collectionId: link.collectionId, userId } },
  });
  if (existing) return NextResponse.json({ collectionId: link.collectionId });

  // Atomically take one use, so two people can't both redeem a one-time link
  const taken = await prisma.shareLink.updateMany({
    where: {
      id: link.id,
      revokedAt: null,
      ...(link.maxUses !== null ? { uses: { lt: link.maxUses } } : {}),
    },
    data: { uses: { increment: 1 } },
  });
  if (taken.count === 0) throw new HttpError(410, "Pozvánka už byla použita");

  await prisma.$transaction([
    prisma.collectionContributor.create({ data: { collectionId: link.collectionId, userId, role: "EDITOR" } }),
    // A contributor doesn't need to follow it anymore
    prisma.collectionFollow.deleteMany({ where: { collectionId: link.collectionId, userId } }),
  ]);

  return NextResponse.json({ collectionId: link.collectionId });
});
