import { TRPCError } from "@trpc/server";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { randomBytes, createHash } from "crypto";
import { db } from "../../db";
import { apiKeys, organizationMembers } from "../../db/schema";
import { router, authedProcedure } from "../init";

function generateApiKey(): { key: string; prefix: string; hash: string } {
  const raw = randomBytes(32).toString("hex");
  const prefix = `bmhq_${raw.slice(0, 8)}`;
  const key = `${prefix}${raw.slice(8)}`;
  const hash = createHash("sha256").update(key).digest("hex");
  return { key, prefix, hash };
}

const listSchema = z.object({
  organizationId: z.string().uuid(),
});

const createSchema = z.object({
  organizationId: z.string().uuid(),
  name: z.string().min(1),
  scopes: z.array(z.string()),
  expiresAt: z.string().datetime().optional(),
});

const updateSchema = z.object({
  organizationId: z.string().uuid(),
  apiKeyId: z.string().uuid(),
  name: z.string().min(1).optional(),
  isActive: z.boolean().optional(),
  scopes: z.array(z.string()).optional(),
});

const deleteSchema = z.object({
  organizationId: z.string().uuid(),
  apiKeyId: z.string().uuid(),
});

async function requireOrgMember(organizationId: string, userId: string) {
  const [membership] = await db
    .select()
    .from(organizationMembers)
    .where(
      and(
        eq(organizationMembers.organizationId, organizationId),
        eq(organizationMembers.userId, userId)
      )
    )
    .limit(1);

  if (!membership) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Organization not found",
    });
  }

  return membership;
}

export const apiKeysRouter = router({
  list: authedProcedure.input(listSchema).query(async ({ ctx, input }) => {
    await requireOrgMember(input.organizationId, ctx.userId);

    const rows = await db
      .select({
        id: apiKeys.id,
        name: apiKeys.name,
        prefix: apiKeys.prefix,
        scopes: apiKeys.scopes,
        isActive: apiKeys.isActive,
        lastUsedAt: apiKeys.lastUsedAt,
        expiresAt: apiKeys.expiresAt,
        createdAt: apiKeys.createdAt,
      })
      .from(apiKeys)
      .where(
        and(
          eq(apiKeys.organizationId, input.organizationId),
          eq(apiKeys.userId, ctx.userId)
        )
      );

    return { data: rows };
  }),

  create: authedProcedure
    .input(createSchema)
    .mutation(async ({ ctx, input }) => {
      await requireOrgMember(input.organizationId, ctx.userId);

      const { key, prefix, hash } = generateApiKey();

      const [apiKey] = await db
        .insert(apiKeys)
        .values({
          organizationId: input.organizationId,
          userId: ctx.userId,
          name: input.name,
          keyHash: hash,
          prefix,
          scopes: input.scopes,
          expiresAt: input.expiresAt ? new Date(input.expiresAt) : undefined,
        })
        .returning({
          id: apiKeys.id,
          prefix: apiKeys.prefix,
          name: apiKeys.name,
        });

      return { ...apiKey, key };
    }),

  update: authedProcedure
    .input(updateSchema)
    .mutation(async ({ ctx, input }) => {
      await requireOrgMember(input.organizationId, ctx.userId);

      const updates: Record<string, unknown> = { updatedAt: new Date() };
      if (input.name !== undefined) updates.name = input.name;
      if (input.isActive !== undefined) updates.isActive = input.isActive;
      if (input.scopes !== undefined) updates.scopes = input.scopes;

      const [apiKey] = await db
        .update(apiKeys)
        .set(updates)
        .where(
          and(
            eq(apiKeys.id, input.apiKeyId),
            eq(apiKeys.organizationId, input.organizationId),
            eq(apiKeys.userId, ctx.userId)
          )
        )
        .returning({
          id: apiKeys.id,
          isActive: apiKeys.isActive,
        });

      if (!apiKey) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "API key not found",
        });
      }

      return apiKey;
    }),

  delete: authedProcedure
    .input(deleteSchema)
    .mutation(async ({ ctx, input }) => {
      await requireOrgMember(input.organizationId, ctx.userId);

      const [apiKey] = await db
        .select({ id: apiKeys.id })
        .from(apiKeys)
        .where(
          and(
            eq(apiKeys.id, input.apiKeyId),
            eq(apiKeys.organizationId, input.organizationId),
            eq(apiKeys.userId, ctx.userId)
          )
        )
        .limit(1);

      if (!apiKey) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "API key not found",
        });
      }

      await db.delete(apiKeys).where(eq(apiKeys.id, input.apiKeyId));

      return { success: true };
    }),
});
