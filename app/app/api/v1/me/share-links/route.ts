import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { handle, readJson, requireUserId } from "@/lib/server/http";
import { generateShareToken, serializeShareLink } from "@/lib/server/shareLinks";

/** GET /api/v1/me/share-links — links that let people see your (private) profile */
export const GET = handle(async () => {
  const userId = await requireUserId();
  const links = await prisma.shareLink.findMany({
    where: { profileUserId: userId, purpose: "PROFILE_VIEW" },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(links.map(serializeShareLink));
});

/** POST /api/v1/me/share-links   Body: { label? } */
export const POST = handle(async (req: NextRequest) => {
  const userId = await requireUserId();
  const body = await readJson<{ label?: string }>(req).catch(() => ({} as { label?: string }));
  const link = await prisma.shareLink.create({
    data: {
      token: generateShareToken(),
      purpose: "PROFILE_VIEW",
      label: body.label?.trim().slice(0, 100) || null,
      createdById: userId,
      profileUserId: userId,
    },
  });
  return NextResponse.json(serializeShareLink(link), { status: 201 });
});
