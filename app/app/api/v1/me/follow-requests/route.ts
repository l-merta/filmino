import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { handle, requireUserId } from "@/lib/server/http";
import { publicUserSelect } from "@/lib/server/collections";

/** GET /api/v1/me/follow-requests — pending requests, followers and who you follow */
export const GET = handle(async () => {
  const userId = await requireUserId();
  const [incoming, following] = await Promise.all([
    prisma.userFollow.findMany({
      where: { followingId: userId },
      include: { follower: { select: publicUserSelect } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.userFollow.findMany({
      where: { followerId: userId },
      include: { following: { select: publicUserSelect } },
      orderBy: { createdAt: "desc" },
    }),
  ]);
  return NextResponse.json({
    requests: incoming.filter((f) => f.status === "PENDING").map((f) => f.follower),
    followers: incoming.filter((f) => f.status === "ACCEPTED").map((f) => f.follower),
    following: following.map((f) => ({ ...f.following, status: f.status })),
  });
});
