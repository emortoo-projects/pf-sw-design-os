import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { verifyToken } from "../auth/jwt";

export interface Context {
  userId: string | null;
}

export async function createContext(req: Request): Promise<Context> {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return { userId: null };
  }

  try {
    const token = authHeader.slice(7);
    const payload = await verifyToken(token);
    if (payload.type !== "access") {
      return { userId: null };
    }
    return { userId: payload.sub };
  } catch {
    return { userId: null };
  }
}

const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const createCallerFactory = t.createCallerFactory;

export const authedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Authentication required",
    });
  }
  return next({ ctx: { userId: ctx.userId } });
});
