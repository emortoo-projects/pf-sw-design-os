import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../../db";
import { aiProviders } from "../../db/schema";
import { router, publicProcedure } from "../init";

const getByIdSchema = z.object({
  providerId: z.string().uuid(),
});

export const aiProvidersRouter = router({
  list: publicProcedure.query(async () => {
    const rows = await db
      .select({
        id: aiProviders.id,
        slug: aiProviders.slug,
        name: aiProviders.name,
        logoUrl: aiProviders.logoUrl,
        isActive: aiProviders.isActive,
      })
      .from(aiProviders)
      .where(eq(aiProviders.isActive, true));

    return { data: rows };
  }),

  getById: publicProcedure.input(getByIdSchema).query(async ({ input }) => {
    const [provider] = await db
      .select({
        id: aiProviders.id,
        slug: aiProviders.slug,
        name: aiProviders.name,
        logoUrl: aiProviders.logoUrl,
        isActive: aiProviders.isActive,
        configSchema: aiProviders.configSchema,
        createdAt: aiProviders.createdAt,
      })
      .from(aiProviders)
      .where(eq(aiProviders.id, input.providerId))
      .limit(1);

    if (!provider) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "AI provider not found",
      });
    }

    return provider;
  }),
});
