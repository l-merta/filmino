// Client-side helpers + types for collections, profiles and share links.
import { apiClient, apiDelete, apiGet, apiPost } from "@/lib/apiClient";

/** When adding a collection into another one: nest the whole collection, or copy just its items. */
export type AddMode = "whole" | "contents";

/** Language of TMDB texts / images: Czech, English or the movie's original language. */
export type LanguagePref = "cs" | "en" | "original";

export type SystemKind = "FAVORITES" | "WATCHED" | "WATCHLIST";

/** Something that can be put in a collection. */
export type MediaRef = {
  type: "movie" | "tv" | "season" | "episode" | "collection" | "tmdb_collection";
  tmdbId?: number;
  seasonNumber?: number;
  episodeNumber?: number;
  collectionId?: string;
  // Display data stored with the item
  title: string;
  subtitle?: string | null;
  posterPath?: string | null;
  year?: string | null;
};

export function itemKey(ref: MediaRef): string {
  switch (ref.type) {
    case "season":
      return `season:${ref.tmdbId}:${ref.seasonNumber}`;
    case "episode":
      return `episode:${ref.tmdbId}:${ref.seasonNumber}:${ref.episodeNumber}`;
    case "collection":
      return `collection:${ref.collectionId}`;
    default:
      return `${ref.type}:${ref.tmdbId}`;
  }
}

const pad = (n: number | null | undefined) => String(n ?? 0).padStart(2, "0");

/** Where an item lives in the app. Accepts both MediaRef and stored items (uppercase type). */
export function itemHref(item: {
  type: string;
  tmdbId?: number | null;
  seasonNumber?: number | null;
  episodeNumber?: number | null;
  collectionId?: string | null;
  childCollectionId?: string | null;
}): string {
  switch (item.type.toLowerCase()) {
    case "movie":
      return `/filmy/${item.tmdbId}`;
    case "tv":
      return `/serialy/${item.tmdbId}`;
    case "season":
      return `/serialy/${item.tmdbId}/s${pad(item.seasonNumber)}`;
    case "episode":
      return `/serialy/${item.tmdbId}/s${pad(item.seasonNumber)}/e${pad(item.episodeNumber)}`;
    case "tmdb_collection":
      return `/filmy/kolekce/${item.tmdbId}`;
    case "collection":
      return `/kolekce/${item.collectionId ?? item.childCollectionId}`;
    default:
      return "/";
  }
}

export const ITEM_TYPE_LABEL: Record<string, string> = {
  MOVIE: "Film",
  TV: "Seriál",
  SEASON: "Série",
  EPISODE: "Epizoda",
  COLLECTION: "Kolekce",
  TMDB_COLLECTION: "Filmová série",
};

export const SYSTEM_LABEL: Record<SystemKind, string> = {
  FAVORITES: "Oblíbené",
  WATCHED: "Zhlédnuté",
  WATCHLIST: "Chci vidět",
};

// ---------------------------------------------------------------------------
// Types returned by the API
// ---------------------------------------------------------------------------

export type PublicUser = { id: string; username: string; image: string | null };

export type CollectionSummary = {
  id: string;
  name: string;
  description: string | null;
  system: SystemKind | null;
  isPublic: boolean;
  showInLists: boolean;
  ownerId: string;
  owner?: PublicUser;
  forkedFromId: string | null;
  itemCount?: number;
  posters: string[];
};

export type CollectionItem = {
  id: string;
  itemKey: string;
  type: string;
  tmdbId: number | null;
  seasonNumber: number | null;
  episodeNumber: number | null;
  childCollectionId: string | null;
  title: string;
  subtitle: string | null;
  posterPath: string | null;
  year: string | null;
  createdAt: string;
  addedBy: PublicUser | null;
};

export type CollectionDetail = {
  id: string;
  name: string;
  description: string | null;
  system: SystemKind | null;
  isPublic: boolean;
  showInLists: boolean;
  addToEnd: boolean;
  createdAt: string;
  updatedAt: string;
  owner: PublicUser;
  forkedFrom: { id: string; name: string; owner: PublicUser } | null;
  contributors: (PublicUser & { role: "OWNER" | "EDITOR" })[];
  items: CollectionItem[];
  counts: { follows: number; forks: number; watched: number; items: number };
  viewer: { loggedIn: boolean; canEdit: boolean; isOwner: boolean; isContributor: boolean; isFollowing: boolean };
};

export type ItemStatus = {
  system: Partial<Record<SystemKind, { id: string; contains: boolean }>>;
  collections: { id: string; name: string; isPublic: boolean; showInLists: boolean; shared: boolean; contains: boolean }[];
};

export type ShareLinkInfo = {
  id: string;
  token: string;
  purpose: "COLLECTION_VIEW" | "COLLECTION_INVITE" | "PROFILE_VIEW";
  label: string | null;
  maxUses: number | null;
  uses: number;
  createdAt: string;
  usable: boolean;
  createdBy?: { id: string; username: string };
};

export type ProfileResponse = {
  user: PublicUser & { isPublic: boolean; createdAt: string };
  isSelf: boolean;
  viewerFollow: "NONE" | "PENDING" | "ACCEPTED";
  counts: { followers: number; following: number };
  canSeeContent: boolean;
  collections: {
    system: CollectionSummary[];
    owned: CollectionSummary[];
    hidden: CollectionSummary[];
    contributed: CollectionSummary[];
    followed: CollectionSummary[];
  } | null;
};

// ---------------------------------------------------------------------------
// API calls
// ---------------------------------------------------------------------------

export const collectionsApi = {
  itemStatus: (key: string) => apiGet<ItemStatus>("/me/item-status", { key }),
  addItem: (collectionId: string, item: MediaRef, mode?: AddMode) =>
    apiPost<{ added?: number }>(`/collections/${collectionId}/items`, { item, mode }),
  reorderItems: (collectionId: string, keys: string[]) => apiClient.put(`/collections/${collectionId}/items/order`, { keys }),
  removeItem: (collectionId: string, key: string) =>
    apiDelete(`/collections/${collectionId}/items?key=${encodeURIComponent(key)}`),
  create: (body: { name: string; description?: string; isPublic?: boolean; showInLists?: boolean; item?: MediaRef }) =>
    apiPost<CollectionSummary>("/collections", body),
  mine: () =>
    apiGet<{ system: CollectionSummary[]; owned: CollectionSummary[]; contributed: CollectionSummary[]; followed: CollectionSummary[] }>(
      "/collections"
    ),
  get: (id: string, share?: string | null) =>
    apiGet<CollectionDetail>(`/collections/${id}`, share ? { share } : undefined),
  update: (id: string, body: Partial<{ name: string; description: string | null; isPublic: boolean; showInLists: boolean; addToEnd: boolean }>) =>
    apiClient.patch(`/collections/${id}`, body).then((r) => r.data),
  remove: (id: string) => apiDelete(`/collections/${id}`),
  follow: (id: string, share?: string | null) => apiPost(`/collections/${id}/follow`, { share: share || undefined }),
  unfollow: (id: string) => apiDelete(`/collections/${id}/follow`),
  fork: (id: string, share?: string | null) => apiPost<{ id: string }>(`/collections/${id}/fork`, { share: share || undefined }),
  removeContributor: (id: string, userId: string) => apiDelete(`/collections/${id}/contributors/${userId}`),
  shareLinks: (id: string) => apiGet<ShareLinkInfo[]>(`/collections/${id}/share-links`),
  createShareLink: (id: string, purpose: "view" | "invite", label?: string) =>
    apiPost<ShareLinkInfo>(`/collections/${id}/share-links`, { purpose, label }),
  deleteShareLink: (linkId: string) => apiDelete(`/share-links/${linkId}`),
};

export const usersApi = {
  profile: (id: string, share?: string | null) => apiGet<ProfileResponse>(`/users/${id}`, share ? { share } : undefined),
  follow: (id: string) => apiPost<{ status: "PENDING" | "ACCEPTED" }>(`/users/${id}/follow`),
  unfollow: (id: string) => apiDelete(`/users/${id}/follow`),
  me: () =>
    apiGet<{ id: string; username: string; email: string; image: string | null; isPublic: boolean; textLanguage: LanguagePref; imageLanguage: LanguagePref; hasPassword: boolean }>("/me"),
  updateMe: (body: Partial<{ username: string; email: string; isPublic: boolean; textLanguage: LanguagePref; imageLanguage: LanguagePref; newPassword: string; currentPassword: string }>) =>
    apiClient.patch("/me", body).then((r) => r.data),
  followRequests: () =>
    apiGet<{ requests: PublicUser[]; followers: PublicUser[]; following: (PublicUser & { status: string })[] }>("/me/follow-requests"),
  acceptFollower: (userId: string) => apiPost(`/me/follow-requests/${userId}`),
  removeFollower: (userId: string) => apiDelete(`/me/follow-requests/${userId}`),
  profileShareLinks: () => apiGet<ShareLinkInfo[]>("/me/share-links"),
  createProfileShareLink: (label?: string) => apiPost<ShareLinkInfo>("/me/share-links", { label }),
};

/** Czech plural: plural(1, "položka", "položky", "položek") */
export function plural(n: number, one: string, few: string, many: string): string {
  const word = n === 1 ? one : n >= 2 && n <= 4 ? few : many;
  return `${n} ${word}`;
}

export function shareUrl(token: string): string {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  return `${origin}/s/${token}`;
}

/** Pulls the API's error message out of an axios error. */
export function errorMessage(err: unknown, fallback = "Něco se pokazilo"): string {
  const e = err as { response?: { data?: { error?: string } }; message?: string };
  return e?.response?.data?.error || e?.message || fallback;
}
