import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { handle, readJson, requireUserId, HttpError } from "@/lib/server/http";
import { requireCollectionAccess } from "@/lib/server/collections";

type Ctx = { params: Promise<{ id: string }> };

/**
 * PUT /api/v1/collections/:id/items/order
 * Body: { keys: string[] } — the item keys in their new order (first = top).
 * Works for every collection you can edit, including Favorites / Watched / Watchlist.
 */
export const PUT = handle(async (req: NextRequest, { params }: Ctx) => {
  const { id } = await params;
  const userId = await requireUserId();
  await requireCollectionAccess(id, userId, "edit");

  const body = await readJson<{ keys?: unknown }>(req);
  if (!Array.isArray(body.keys) || !body.keys.every((k) => typeof k === "string")) {
    throw new HttpError(400, "Chybí pořadí položek");
  }
  const keys = body.keys as string[];

  const existing = await prisma.collectionItem.findMany({ where: { collectionId: id }, select: { itemKey: true } });
  const existingKeys = new Set(existing.map((e) => e.itemKey));
  // Someone else may have added/removed items meanwhile: order what we got,
  // and put anything we didn't get after it.
  const ordered = keys.filter((k) => existingKeys.has(k));
  const rest = existing.map((e) => e.itemKey).filter((k) => !ordered.includes(k));

  await prisma.$transaction(
    [...ordered, ...rest].map((itemKey, index) =>
      prisma.collectionItem.update({
        where: { collectionId_itemKey: { collectionId: id, itemKey } },
        data: { position: index + 1 },
      })
    )
  );
  await prisma.collection.update({ where: { id }, data: { updatedAt: new Date() } });

  return NextResponse.json({ ok: true });
});
