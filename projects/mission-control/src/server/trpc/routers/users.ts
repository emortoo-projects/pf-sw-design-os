import { z } from "zod";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../trpc";
import { users } from "@/server/db/schema";

const updateProfileSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  email: z.string().email().optional(),
});

export const usersRouter = router({
  me: protectedProcedure.query(async ({ ctx }) => {
    const [user] = await ctx.db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .where(eq(users.id, ctx.user.userId))
      .limit(1);

    if (!user) {
      throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
    }

    return user;
  }),

  updateMe: protectedProcedure
    .input(updateProfileSchema)
    .mutation(async ({ ctx, input }) => {
      const updateValues: Record<string, unknown> = {};
      if (input.name !== undefined) updateValues.name = input.name;
      if (input.email !== undefined) updateValues.email = input.email;

      if (Object.keys(updateValues).length === 0) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "No fields to update" });
      }

      updateValues.updatedAt = new Date();

      const [user] = await ctx.db
        .update(users)
        .set(updateValues)
        .where(eq(users.id, ctx.user.userId))
        .returning({
          id: users.id,
          email: users.email,
          name: users.name,
          role: users.role,
          updatedAt: users.updatedAt,
        });

      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      return user;
    }),
});
