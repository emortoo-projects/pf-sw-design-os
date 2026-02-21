import { TRPCError } from "@trpc/server";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { db } from "../../db";
import { dashboardWidgets } from "../../db/schema";
import { router, authedProcedure } from "../init";

const positionSchema = z.object({
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
});

const listSchema = z.object({
  organizationId: z.string().uuid(),
});

const createSchema = z.object({
  organizationId: z.string().uuid(),
  moduleId: z.string().uuid().optional(),
  widgetType: z.string().min(1),
  title: z.string().min(1),
  position: positionSchema,
  configuration: z.record(z.string(), z.unknown()).optional(),
});

const updateSchema = z.object({
  organizationId: z.string().uuid(),
  widgetId: z.string().uuid(),
  title: z.string().min(1).optional(),
  position: positionSchema.optional(),
  configuration: z.record(z.string(), z.unknown()).nullable().optional(),
  isVisible: z.boolean().optional(),
});

const deleteSchema = z.object({
  organizationId: z.string().uuid(),
  widgetId: z.string().uuid(),
});

export const dashboardWidgetsRouter = router({
  list: authedProcedure.input(listSchema).query(async ({ ctx, input }) => {
    const rows = await db
      .select()
      .from(dashboardWidgets)
      .where(
        and(
          eq(dashboardWidgets.organizationId, input.organizationId),
          eq(dashboardWidgets.userId, ctx.userId)
        )
      );

    return { data: rows };
  }),

  create: authedProcedure
    .input(createSchema)
    .mutation(async ({ ctx, input }) => {
      const [widget] = await db
        .insert(dashboardWidgets)
        .values({
          userId: ctx.userId,
          organizationId: input.organizationId,
          moduleId: input.moduleId,
          widgetType: input.widgetType,
          title: input.title,
          position: input.position,
          configuration: input.configuration,
        })
        .returning({
          id: dashboardWidgets.id,
          widgetType: dashboardWidgets.widgetType,
          title: dashboardWidgets.title,
        });

      return widget;
    }),

  update: authedProcedure
    .input(updateSchema)
    .mutation(async ({ ctx, input }) => {
      const updates: Record<string, unknown> = { updatedAt: new Date() };
      if (input.title !== undefined) updates.title = input.title;
      if (input.position !== undefined) updates.position = input.position;
      if (input.configuration !== undefined)
        updates.configuration = input.configuration;
      if (input.isVisible !== undefined) updates.isVisible = input.isVisible;

      const [widget] = await db
        .update(dashboardWidgets)
        .set(updates)
        .where(
          and(
            eq(dashboardWidgets.id, input.widgetId),
            eq(dashboardWidgets.organizationId, input.organizationId),
            eq(dashboardWidgets.userId, ctx.userId)
          )
        )
        .returning({
          id: dashboardWidgets.id,
          isVisible: dashboardWidgets.isVisible,
        });

      if (!widget) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Widget not found",
        });
      }

      return widget;
    }),

  delete: authedProcedure
    .input(deleteSchema)
    .mutation(async ({ ctx, input }) => {
      const [widget] = await db
        .select({ id: dashboardWidgets.id })
        .from(dashboardWidgets)
        .where(
          and(
            eq(dashboardWidgets.id, input.widgetId),
            eq(dashboardWidgets.organizationId, input.organizationId),
            eq(dashboardWidgets.userId, ctx.userId)
          )
        )
        .limit(1);

      if (!widget) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Widget not found",
        });
      }

      await db
        .delete(dashboardWidgets)
        .where(eq(dashboardWidgets.id, input.widgetId));

      return { success: true };
    }),
});
