import { NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

/** Get the logged in user's id or throw a 401 error. */
export async function requireUserId(): Promise<string> {
  const userId = await getUserId();
  if (!userId) throw new HttpError(401, "Musíte být přihlášeni");
  return userId;
}

/**
 * Wraps a route handler so that thrown HttpErrors become JSON responses
 * and unexpected errors become a 500 without leaking details.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function handle<A extends any[]>(fn: (...args: A) => Promise<Response>) {
  return async (...args: A): Promise<Response> => {
    try {
      return await fn(...args);
    } catch (err) {
      if (err instanceof HttpError) return jsonError(err.message, err.status);
      console.error("API error:", err);
      return jsonError("Internal server error", 500);
    }
  };
}

export async function readJson<T = Record<string, unknown>>(req: Request): Promise<T> {
  try {
    return (await req.json()) as T;
  } catch {
    throw new HttpError(400, "Neplatný požadavek");
  }
}
