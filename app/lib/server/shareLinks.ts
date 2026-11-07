import { randomBytes } from "crypto";
import type { ShareLink } from "@prisma/client";

/** 32 random bytes → 43 url-safe characters. Impossible to guess, unlike a user/collection id. */
export function generateShareToken(): string {
  return randomBytes(32).toString("base64url");
}

/** A link works only if it was not revoked, has not expired and has uses left. */
export function isShareLinkUsable(link: Pick<ShareLink, "revokedAt" | "expiresAt" | "maxUses" | "uses"> | null | undefined): boolean {
  if (!link) return false;
  if (link.revokedAt) return false;
  if (link.expiresAt && link.expiresAt.getTime() < Date.now()) return false;
  if (link.maxUses !== null && link.maxUses !== undefined && link.uses >= link.maxUses) return false;
  return true;
}

export function serializeShareLink(link: ShareLink) {
  return {
    id: link.id,
    token: link.token,
    purpose: link.purpose,
    label: link.label,
    maxUses: link.maxUses,
    uses: link.uses,
    expiresAt: link.expiresAt,
    revokedAt: link.revokedAt,
    createdAt: link.createdAt,
    usable: isShareLinkUsable(link),
  };
}
