import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { handle, requireUserId, HttpError } from "@/lib/server/http";

type Ctx = { params: Promise<{ id: string }> };

/**
 * POST /api/v1/users/:id/follow
 * Public profile → you follow right away. Private profile → a request the user must accept.
 */
export const POST = handle(async (_req: NextRequest, { params }: Ctx) => {
  const { id } = await params;
  const userId = await requireUserId();
  if (id === userId) throw new HttpError(400, "Nemůžete sledovat sami sebe");

  const target = await prisma.users.findUnique({ where: { id }, select: { isPublic: true } });
  if (!target) throw new HttpError(404, "Uživatel nenalezen");

  const follow = await prisma.userFollow.upsert({
    where: { followerId_followingId: { followerId: userId, followingId: id } },
    create: { followerId: userId, followingId: id, status: target.isPublic ? "ACCEPTED" : "PENDING" },
    update: {},
  });
  return NextResponse.json({ status: follow.status });
});

/** DELETE /api/v1/users/:id/follow — unfollow or cancel a pending request */
export const DELETE = handle(async (_req: NextRequest, { params }: Ctx) => {
  const { id } = await params;
  const userId = await requireUserId();
  await prisma.userFollow.deleteMany({ where: { followerId: userId, followingId: id } });
  return NextResponse.json({ status: "NONE" });
});
