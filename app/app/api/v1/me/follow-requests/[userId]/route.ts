import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { handle, requireUserId, HttpError } from "@/lib/server/http";

type Ctx = { params: Promise<{ userId: string }> };

/** POST /api/v1/me/follow-requests/:userId — accept a follow request */
export const POST = handle(async (_req: NextRequest, { params }: Ctx) => {
  const { userId: followerId } = await params;
  const userId = await requireUserId();
  const res = await prisma.userFollow.updateMany({
    where: { followerId, followingId: userId },
    data: { status: "ACCEPTED" },
  });
  if (res.count === 0) throw new HttpError(404, "Žádost nenalezena");
  return NextResponse.json({ ok: true });
});

/** DELETE /api/v1/me/follow-requests/:userId — decline a request or remove a follower */
export const DELETE = handle(async (_req: NextRequest, { params }: Ctx) => {
  const { userId: followerId } = await params;
  const userId = await requireUserId();
  await prisma.userFollow.deleteMany({ where: { followerId, followingId: userId } });
  return NextResponse.json({ ok: true });
});
