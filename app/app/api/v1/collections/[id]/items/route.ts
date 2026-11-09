import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { handle, readJson, requireUserId, HttpError } from "@/lib/server/http";
import { addCollectionContents, addTmdbCollectionContents, insertPosition, containsCollection, itemInputToData, requireCollectionAccess, type ItemInput } from "@/lib/server/collections";

type Ctx = { params: Promise<{ id: string }> };

/**
 * POST /api/v1/collections/:id/items
 * Body: { item: ItemInput, mode?: "whole" | "contents" }
 * Adds a movie / show / season / episode / collection.
 * For a collection, mode "contents" copies its items instead of nesting the collection itself.
 */
export const POST = handle(async (req: NextRequest, { params }: Ctx) => {
  const { id } = await params;
  const userId = await requireUserId();
  await requireCollectionAccess(id, userId, "edit");

  const body = await readJson<{ item?: ItemInput; mode?: "whole" | "contents" }>(req);
  if (!body.item) throw new HttpError(400, "Chybí položka");
  const data = itemInputToData(body.item);

  if (body.mode === "contents") {
    let added: number;
    if (data.type === "TMDB_COLLECTION" && data.tmdbId !== null) {
      // e.g. "Harry Potter Collection" -> add the individual movies
      added = await addTmdbCollectionContents(data.tmdbId, id, userId);
    } else if (data.childCollectionId) {
      added = await addCollectionContents(data.childCollectionId, id, userId);
    } else {
      throw new HttpError(400, "Obsah lze přidat jen z kolekce");
    }
    return NextResponse.json({ added }, { status: 201 });
  }

  if (data.childCollectionId) {
    if (data.childCollectionId === id) throw new HttpError(400, "Kolekci nelze přidat samu do sebe");
    const child = await requireCollectionAccess(data.childCollectionId, userId, "view");
    // Adding B into A is a loop if A is already somewhere inside B
    if (await containsCollection(data.childCollectionId, id)) {
      throw new HttpError(400, "Tato kolekce už obsahuje cílovou kolekci (vznikla by smyčka)");
    }
    data.title = child.collection.name;
  }

  const item = await prisma.collectionItem.upsert({
    where: { collectionId_itemKey: { collectionId: id, itemKey: data.itemKey } },
    create: { ...data, collectionId: id, addedById: userId, position: await insertPosition(id) },
    update: {},
  });
  await prisma.collection.update({ where: { id }, data: { updatedAt: new Date() } });

  return NextResponse.json(item, { status: 201 });
});

/** DELETE /api/v1/collections/:id/items?key=movie:550 */
export const DELETE = handle(async (req: NextRequest, { params }: Ctx) => {
  const { id } = await params;
  const userId = await requireUserId();
  await requireCollectionAccess(id, userId, "edit");

  const key = req.nextUrl.searchParams.get("key");
  if (!key) throw new HttpError(400, "Chybí klíč položky");

  await prisma.collectionItem.deleteMany({ where: { collectionId: id, itemKey: key } });
  return NextResponse.json({ ok: true });
});
