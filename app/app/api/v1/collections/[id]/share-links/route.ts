import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { handle, readJson, requireUserId, HttpError } from "@/lib/server/http";
import { requireCollectionAccess } from "@/lib/server/collections";
import { generateShareToken, serializeShareLink } from "@/lib/server/shareLinks";

type Ctx = { params: Promise<{ id: string }> };

/** GET /api/v1/collections/:id/share-links — contributors see all links of the collection. */
export const GET = handle(async (_req: NextRequest, { params }: Ctx) => {
  const { id } = await params;
  const userId = await requireUserId();
  await requireCollectionAccess(id, userId, "edit");

  const links = await prisma.shareLink.findMany({
    where: { collectionId: id },
    orderBy: { createdAt: "desc" },
    include: { createdBy: { select: { id: true, username: true } } },
  });
  return NextResponse.json(links.map((l) => ({ ...serializeShareLink(l), createdBy: l.createdBy })));
});

/**
 * POST /api/v1/collections/:id/share-links   Body: { purpose: "view" | "invite", label? }
 * "view"   = read-only link (unlimited uses)
 * "invite" = one-time link that makes the visitor a contributor
 */
export const POST = handle(async (req: NextRequest, { params }: Ctx) => {
  const { id } = await params;
  const userId = await requireUserId();
  const access = await requireCollectionAccess(id, userId, "edit");
  const body = await readJson<{ purpose?: string; label?: string }>(req);

  if (body.purpose !== "view" && body.purpose !== "invite") throw new HttpError(400, "Neplatný typ odkazu");
  if (body.purpose === "invite" && access.collection.system) {
    throw new HttpError(400, "Do výchozích kolekcí nelze zvát přispěvatele");
  }

  const link = await prisma.shareLink.create({
    data: {
      token: generateShareToken(),
      purpose: body.purpose === "view" ? "COLLECTION_VIEW" : "COLLECTION_INVITE",
      label: body.label?.trim().slice(0, 100) || null,
      createdById: userId,
      collectionId: id,
      maxUses: body.purpose === "invite" ? 1 : null,
    },
  });
  return NextResponse.json(serializeShareLink(link), { status: 201 });
});
