import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { handle, requireUserId, HttpError } from "@/lib/server/http";
import { ensureSystemCollections } from "@/lib/server/collections";

/**
 * GET /api/v1/me/item-status?key=movie:550
 * Used by the action buttons and the 3-dots menu:
 * - is the item in my Favorites / Watched / Watchlist?
 * - which of my editable custom collections already contain it?
 */
export const GET = handle(async (req: NextRequest) => {
  const userId = await requireUserId();
  const key = req.nextUrl.searchParams.get("key");
  if (!key) throw new HttpError(400, "Chybí klíč položky");

  const system = await ensureSystemCollections(userId);

  const editable = await prisma.collection.findMany({
    where: { system: null, contributors: { some: { userId } } },
    select: {
      id: true,
      name: true,
      isPublic: true,
      showInLists: true,
      ownerId: true,
      items: { where: { itemKey: key }, select: { id: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  const systemIds = system.map((c) => c.id);
  const systemHits = await prisma.collectionItem.findMany({
    where: { collectionId: { in: systemIds }, itemKey: key },
    select: { collectionId: true },
  });

  const status: Record<string, { id: string; contains: boolean }> = {};
  for (const c of system) {
    status[c.system!] = { id: c.id, contains: systemHits.some((h) => h.collectionId === c.id) };
  }

  return NextResponse.json({
    system: status,
    collections: editable
      .filter((c) => `collection:${c.id}` !== key) // can't add a collection into itself
      .map((c) => ({
        id: c.id,
        name: c.name,
        isPublic: c.isPublic,
        showInLists: c.showInLists,
        shared: c.ownerId !== userId,
        contains: c.items.length > 0,
      })),
  });
});
