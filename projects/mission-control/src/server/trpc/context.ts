import { type inferAsyncReturnType } from "@trpc/server";
import { type FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { verifyToken, type TokenPayload } from "@/server/auth/jwt";
import { db } from "@/server/db/client";

export async function createContext(opts: FetchCreateContextFnOptions) {
  let user: TokenPayload | null = null;

  const authHeader = opts.req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    try {
      user = await verifyToken(authHeader.slice(7));
    } catch {
      // Invalid token — proceed as unauthenticated
    }
  }

  return { db, user };
}

export type Context = inferAsyncReturnType<typeof createContext>;
