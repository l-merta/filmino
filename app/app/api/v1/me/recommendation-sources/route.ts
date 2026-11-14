import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { handle, readJson, requireUserId, HttpError } from "@/lib/server/http";
import { getCollectionAccess } from "@/lib/server/collections";

/** GET /api/v1/me/recommendation-sources — ids of the collections "Pro vás" is built from */
export const GET = handle(async () => {
  const userId = await requireUserId();
  const rows = await prisma.recommendationSource.findMany({ where: { userId }, orderBy: { createdAt: "asc" } });
  return NextResponse.json({ collectionIds: rows.map((r) => r.collectionId) });
});

/**
 * PUT /api/v1/me/recommendation-sources
 * Body: { collectionIds: string[] } — replaces the whole selection.
 * Any collection the user can see works (own, shared with them, followed, public).
 */
export const PUT = handle(async (req: NextRequest) => {
  const userId = await requireUserId();
  const body = await readJson<{ collectionIds?: unknown }>(req);
  if (!Array.isArray(body.collectionIds) || !body.collectionIds.every((id) => typeof id === "string")) {
    throw new HttpError(400, "Neplatný seznam kolekcí");
  }
  const ids = [...new Set(body.collectionIds as string[])];
  if (ids.length > 50) throw new HttpError(400, "Vyberte nejvýše 50 kolekcí");

  for (const id of ids) {
    const access = await getCollectionAccess(id, userId, null);
    if (!access?.canView) throw new HttpError(404, "Kolekce nenalezena");
  }

  await prisma.$transaction([
    prisma.recommendationSource.deleteMany({ where: { userId, collectionId: { notIn: ids } } }),
    ...ids.map((collectionId) =>
      prisma.recommendationSource.upsert({
        where: { userId_collectionId: { userId, collectionId } },
        create: { userId, collectionId },
        update: {},
      })
    ),
  ]);
  return NextResponse.json({ collectionIds: ids });
});
