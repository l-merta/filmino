import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";

import { prisma } from "@/lib/prisma";
import { handle, readJson, requireUserId, HttpError } from "@/lib/server/http";
import { forgetLanguagePrefs, isLanguagePref } from "@/lib/server/languagePrefs";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_REGEX = /^[\p{L}\p{N}_.-]{3,30}$/u;

/** GET /api/v1/me — data for the settings page */
export const GET = handle(async () => {
  const userId = await requireUserId();
  const user = await prisma.users.findUniqueOrThrow({ where: { id: userId } });
  return NextResponse.json({
    id: user.id,
    username: user.username,
    email: user.email,
    image: user.image,
    isPublic: user.isPublic,
    textLanguage: user.textLanguage,
    imageLanguage: user.imageLanguage,
    hasPassword: !!user.password,
  });
});

/**
 * PATCH /api/v1/me
 * Body: { username?, email?, isPublic?, textLanguage?, imageLanguage?, newPassword?, currentPassword? }
 * Changing e-mail or password requires the current password (if the account has one).
 */
export const PATCH = handle(async (req: NextRequest) => {
  const userId = await requireUserId();
  const body = await readJson<{ username?: string; email?: string; isPublic?: boolean; textLanguage?: string; imageLanguage?: string; newPassword?: string; currentPassword?: string }>(req);
  const user = await prisma.users.findUniqueOrThrow({ where: { id: userId } });

  const data: { username?: string; email?: string; isPublic?: boolean; password?: string; textLanguage?: string; imageLanguage?: string } = {};

  if (body.username !== undefined && body.username.trim() !== user.username) {
    const username = body.username.trim();
    if (!USERNAME_REGEX.test(username)) {
      throw new HttpError(400, "Uživatelské jméno musí mít 3–30 znaků (písmena, čísla, _ . -)");
    }
    data.username = username;
  }

  const emailChanged = body.email !== undefined && body.email.trim().toLowerCase() !== user.email.toLowerCase();
  if (emailChanged) {
    const email = body.email!.trim();
    if (!EMAIL_REGEX.test(email)) throw new HttpError(400, "Neplatný formát e-mailu");
    data.email = email;
  }

  if (body.newPassword) {
    if (body.newPassword.length < 8) throw new HttpError(400, "Heslo musí mít alespoň 8 znaků");
    data.password = await bcrypt.hash(body.newPassword, 10);
  }

  // Sensitive changes need the current password
  if ((emailChanged || body.newPassword) && user.password) {
    if (!body.currentPassword || !(await bcrypt.compare(body.currentPassword, user.password))) {
      throw new HttpError(403, "Nesprávné současné heslo");
    }
  }

  if (body.isPublic !== undefined) data.isPublic = !!body.isPublic;
  for (const key of ["textLanguage", "imageLanguage"] as const) {
    if (body[key] === undefined) continue;
    if (!isLanguagePref(body[key])) throw new HttpError(400, "Neplatný jazyk");
    data[key] = body[key];
  }

  try {
    await prisma.users.update({ where: { id: userId }, data });
    forgetLanguagePrefs(userId);
  } catch (err) {
    if ((err as { code?: string }).code === "P2002") {
      throw new HttpError(400, "Toto uživatelské jméno nebo e-mail už někdo používá");
    }
    throw err;
  }

  // Going public auto-accepts everyone who was waiting
  if (data.isPublic === true) {
    await prisma.userFollow.updateMany({ where: { followingId: userId, status: "PENDING" }, data: { status: "ACCEPTED" } });
  }

  return NextResponse.json({ ok: true });
});
