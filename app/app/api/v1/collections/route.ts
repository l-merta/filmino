import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { handle, readJson, requireUserId, HttpError } from "@/lib/server/http";
import {
  collectionSummaryInclude,
  ensureSystemCollections,
  filterAccessibleFollows,
  itemInputToData,
  serializeCollectionSummary,
  requireCollectionAccess,
  type ItemInput,
} from "@/lib/server/collections";

/**
 * GET /api/v1/collections
 * Everything on the "My collections" page: system, owned, contributed and followed collections.
 */
export const GET = handle(async () => {
  const userId = await requireUserId();
  await ensureSystemCollections(userId);

  const [mine, contributed, followed] = await Promise.all([
    prisma.collection.findMany({
      where: { ownerId: userId },
      include: collectionSummaryInclude,
      orderBy: { updatedAt: "desc" },
    }),
    prisma.collection.findMany({
      where: { ownerId: { not: userId }, contributors: { some: { userId } } },
      include: collectionSummaryInclude,
      orderBy: { updatedAt: "desc" },
    }),
    prisma.collectionFollow.findMany({
      where: { userId },
      include: { collection: { include: collectionSummaryInclude } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const order = ["FAVORITES", "WATCHED", "WATCHLIST"];
  const system = mine.filter((c) => c.system).sort((a, b) => order.indexOf(a.system!) - order.indexOf(b.system!));

  return NextResponse.json({
    system: system.map(serializeCollectionSummary),
    owned: mine.filter((c) => !c.system).map(serializeCollectionSummary),
    contributed: contributed.map(serializeCollectionSummary),
    followed: (await filterAccessibleFollows(userId, followed)).map((f) => serializeCollectionSummary(f.collection)),
  });
});

/**
 * POST /api/v1/collections
 * Body: { name, description?, isPublic?, showInLists?, item? }
 * Creates a custom collection. `item` lets the "add to collection" popup create + add in one step.
 */
export const POST = handle(async (req: NextRequest) => {
  const userId = await requireUserId();
  const body = await readJson<{ name?: string; description?: string; isPublic?: boolean; showInLists?: boolean; item?: ItemInput }>(req);

  const name = (body.name ?? "").trim();
  if (!name) throw new HttpError(400, "Zadejte název kolekce");
  if (name.length > 100) throw new HttpError(400, "Název je příliš dlouhý (max. 100 znaků)");

  const itemData = body.item ? itemInputToData(body.item) : null;
  if (itemData?.childCollectionId) {
    // Can only nest a collection you are allowed to see
    await requireCollectionAccess(itemData.childCollectionId, userId, "view");
  }

  const collection = await prisma.collection.create({
    data: {
      name,
      description: body.description?.trim().slice(0, 2000) || null,
      isPublic: body.isPublic ?? false, // custom collections are private by default
      showInLists: body.showInLists ?? true,
      ownerId: userId,
      contributors: { create: { userId, role: "OWNER" } },
      items: itemData ? { create: { ...itemData, addedById: userId } } : undefined,
    },
    include: collectionSummaryInclude,
  });

  return NextResponse.json(serializeCollectionSummary(collection), { status: 201 });
});
