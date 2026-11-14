import { NextRequest, NextResponse } from "next/server";

import { getUserId } from "@/lib/auth";
import { handle } from "@/lib/server/http";
import { requireCollectionAccess } from "@/lib/server/collections";
import { buildRecommendations, collectSeeds, parseMediaType } from "@/lib/server/recommendations";

type Ctx = { params: Promise<{ id: string }> };

/**
 * GET /api/v1/collections/:id/similar?type=movie|tv&page=1&share=<token>
 * "Podobné" at the end of a collection: recommendations of everything inside it,
 * in the same shape as TMDB lists ({ page, results, total_pages, total_results }).
 */
export const GET = handle(async (req: NextRequest, { params }: Ctx) => {
  const { id } = await params;
  const sp = req.nextUrl.searchParams;
  await requireCollectionAccess(id, await getUserId(), "view", sp.get("share"));

  const seeds = await collectSeeds([id]);
  const page = await buildRecommendations(seeds, parseMediaType(sp.get("type")), Number(sp.get("page") ?? 1), `collection:${id}`);
  return NextResponse.json(page);
});
