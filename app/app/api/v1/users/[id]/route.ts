import { localizePosters } from "@/lib/server/localPosters";
import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/auth";
import { handle, HttpError } from "@/lib/server/http";
import { collectionSummaryInclude, ensureSystemCollections, filterAccessibleFollows, serializeCollectionSummary } from "@/lib/server/collections";
import { isShareLinkUsable } from "@/lib/server/shareLinks";

type Ctx = { params: Promise<{ id: string }> };

/**
 * GET /api/v1/users/:id?share=<token>
 * A user's profile. Private profiles only show their collections to
 * the user themselves, accepted followers, or someone with a profile share link.
 */
export const GET = handle(async (req: NextRequest, { params }: Ctx) => {
  const { id } = await params;
  const viewerId = await getUserId();
  const share = req.nextUrl.searchParams.get("share");

  const user = await prisma.users.findUnique({
    where: { id },
    select: { id: true, username: true, image: true, isPublic: true, createdAt: true },
  });
  if (!user) throw new HttpError(404, "Uživatel nenalezen");

  const isSelf = viewerId === id;

  const [viewerFollow, followers, following] = await Promise.all([
    viewerId && !isSelf
      ? prisma.userFollow.findUnique({ where: { followerId_followingId: { followerId: viewerId, followingId: id } } })
      : null,
    prisma.userFollow.count({ where: { followingId: id, status: "ACCEPTED" } }),
    prisma.userFollow.count({ where: { followerId: id, status: "ACCEPTED" } }),
  ]);

  let viaShareLink = false;
  if (share && !isSelf) {
    const link = await prisma.shareLink.findUnique({ where: { token: share } });
    viaShareLink = !!link && link.purpose === "PROFILE_VIEW" && link.profileUserId === id && isShareLinkUsable(link);
  }

  const canSeeContent = isSelf || user.isPublic || viewerFollow?.status === "ACCEPTED" || viaShareLink;

  let collections = null;
  if (canSeeContent) {
    if (isSelf) await ensureSystemCollections(id);

    const visibility = isSelf ? {} : { isPublic: true, showInLists: true };
    const [owned, contributed, followed] = await Promise.all([
      prisma.collection.findMany({
        where: { ownerId: id, ...visibility },
        include: collectionSummaryInclude,
        orderBy: { updatedAt: "desc" },
      }),
      prisma.collection.findMany({
        where: { ownerId: { not: id }, contributors: { some: { userId: id } }, ...visibility },
        include: collectionSummaryInclude,
        orderBy: { updatedAt: "desc" },
      }),
      isSelf
        ? prisma.collectionFollow.findMany({
            where: { userId: id },
            include: { collection: { include: collectionSummaryInclude } },
            orderBy: { createdAt: "desc" },
          })
        : Promise.resolve([]),
    ]);

    // Preview posters in the viewer's image language
    await localizePosters([...owned, ...contributed, ...followed.map((f) => f.collection)].flatMap((c) => c.items));

    const order = ["FAVORITES", "WATCHED", "WATCHLIST"];
    collections = {
      system: owned
        .filter((c) => c.system)
        .sort((a, b) => order.indexOf(a.system!) - order.indexOf(b.system!))
        .map(serializeCollectionSummary),
      owned: owned.filter((c) => !c.system && c.showInLists).map(serializeCollectionSummary),
      hidden: owned.filter((c) => !c.system && !c.showInLists).map(serializeCollectionSummary),
      contributed: contributed.map(serializeCollectionSummary),
      followed: (await filterAccessibleFollows(id, followed)).map((f) => serializeCollectionSummary(f.collection)),
    };
  }

  return NextResponse.json({
    user,
    isSelf,
    viewerFollow: viewerFollow?.status ?? "NONE",
    counts: { followers, following },
    canSeeContent,
    collections,
  });
});
