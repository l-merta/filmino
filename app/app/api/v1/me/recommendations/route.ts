import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { handle, requireUserId } from "@/lib/server/http";
import { getCollectionAccess } from "@/lib/server/collections";
import { buildRecommendations, collectSeeds, parseMediaType } from "@/lib/server/recommendations";

/**
 * GET /api/v1/me/recommendations?type=movie|tv&page=1
 * "Pro vás": recommendations built from the collections picked in Nastavení účtu.
 * Leaves out what is already in those collections and in the user's "Zhlédnuté".
 * Returns an empty list when no collections are picked.
 */
export const GET = handle(async (req: NextRequest) => {
  const userId = await requireUserId();
  const sp = req.nextUrl.searchParams;
  const type = parseMediaType(sp.get("type"));

  const sources = await prisma.recommendationSource.findMany({ where: { userId }, select: { collectionId: true } });
  // A followed collection can become private later - only use the ones the user can still see
  const allowed: string[] = [];
  for (const s of sources) {
    const access = await getCollectionAccess(s.collectionId, userId, null);
    if (access?.canView) allowed.push(s.collectionId);
  }

  const watched = await prisma.collection.findFirst({ where: { ownerId: userId, system: "WATCHED" }, select: { id: true } });
  const watchedSeeds = watched && !allowed.includes(watched.id) ? await collectSeeds([watched.id], 0) : null;

  const seeds = await collectSeeds(allowed);
  const page = await buildRecommendations(seeds, type, Number(sp.get("page") ?? 1), `user:${userId}`, watchedSeeds?.[type]);
  return NextResponse.json(page);
});
