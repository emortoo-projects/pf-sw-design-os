import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../../db";
import { billingPlans } from "../../db/schema";
import { router, publicProcedure } from "../init";

const getByIdSchema = z.object({
  planId: z.string().uuid(),
});

export const billingPlansRouter = router({
  list: publicProcedure.query(async () => {
    const rows = await db
      .select({
        id: billingPlans.id,
        name: billingPlans.name,
        slug: billingPlans.slug,
        description: billingPlans.description,
        priceMonthly: billingPlans.priceMonthly,
        priceYearly: billingPlans.priceYearly,
        limits: billingPlans.limits,
        features: billingPlans.features,
        isActive: billingPlans.isActive,
      })
      .from(billingPlans)
      .where(eq(billingPlans.isActive, true));

    return { data: rows };
  }),

  getById: publicProcedure
    .input(getByIdSchema)
    .query(async ({ input }) => {
      const [plan] = await db
        .select({
          id: billingPlans.id,
          name: billingPlans.name,
          slug: billingPlans.slug,
          description: billingPlans.description,
          priceMonthly: billingPlans.priceMonthly,
          priceYearly: billingPlans.priceYearly,
          limits: billingPlans.limits,
          features: billingPlans.features,
          isActive: billingPlans.isActive,
          createdAt: billingPlans.createdAt,
        })
        .from(billingPlans)
        .where(eq(billingPlans.id, input.planId))
        .limit(1);

      if (!plan) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Billing plan not found",
        });
      }

      return plan;
    }),
});
