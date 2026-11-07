import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { handle, requireUserId } from "@/lib/server/http";

/**
 * GET /api/v1/me/library
 * Every item key that is in one of my collections, grouped by kind.
 * The cards use this to show the small Favorite / Watched / Watchlist / collection icons
 * without asking the server once per card.
 */
export const GET = handle(async () => {
  const userId = await requireUserId();

  const items = await prisma.collectionItem.findMany({
    where: { collection: { contributors: { some: { userId } } } },
    select: { itemKey: true, collection: { select: { system: true, ownerId: true } } },
  });

  const lib = { FAVORITES: new Set<string>(), WATCHED: new Set<string>(), WATCHLIST: new Set<string>(), CUSTOM: new Set<string>() };
  for (const i of items) {
    const system = i.collection.system;
    if (system) {
      // Only my own Favorites / Watched / Watchlist count
      if (i.collection.ownerId === userId) lib[system].add(i.itemKey);
    } else {
      lib.CUSTOM.add(i.itemKey);
    }
  }

  return NextResponse.json({
    FAVORITES: [...lib.FAVORITES],
    WATCHED: [...lib.WATCHED],
    WATCHLIST: [...lib.WATCHLIST],
    CUSTOM: [...lib.CUSTOM],
  });
});
