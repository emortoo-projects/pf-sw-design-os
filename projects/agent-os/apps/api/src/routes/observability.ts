import { Router, Request, Response } from "express";
import { z } from "zod";
import { llmCalls, costSummaries, auditLogs } from "@agent-os/database";
import { eq, and, gt, asc, desc, sql } from "drizzle-orm";

// LLM Calls router
export const llmCallsRouter = Router({ mergeParams: true });

const listSchema = z.object({
  limit: z.coerce.number().int().positive().max(100).default(20),
  cursor: z.string().uuid().optional(),
});

// GET /workspaces/:workspaceId/llm-calls
llmCallsRouter.get("/", async (req: Request, res: Response) => {
  try {
    const workspaceId = z.string().uuid().parse(req.params.workspaceId);
    const input = listSchema.parse(req.query);
    const { db } = req.app.locals;

    if (!db) {
      res.status(500).json({ error: "Database not configured" });
      return;
    }

    const conditions = [eq(llmCalls.workspaceId, workspaceId)];
    if (input.cursor) {
      conditions.push(gt(llmCalls.id, input.cursor));
    }

    const data = await db
      .select()
      .from(llmCalls)
      .where(and(...conditions))
      .orderBy(desc(llmCalls.createdAt))
      .limit(input.limit + 1);

    const hasMore = data.length > input.limit;
    const results = hasMore ? data.slice(0, input.limit) : data;
    const nextCursor = hasMore ? results[results.length - 1].id : undefined;

    res.json({ data: results, nextCursor, hasMore });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Validation failed", details: error.errors });
      return;
    }
    res.status(500).json({ error: "Failed to list LLM calls" });
  }
});

// Cost Summary router
export const costSummaryRouter = Router({ mergeParams: true });

// GET /workspaces/:workspaceId/cost-summary
costSummaryRouter.get("/", async (req: Request, res: Response) => {
  try {
    const workspaceId = z.string().uuid().parse(req.params.workspaceId);
    const { db } = req.app.locals;

    if (!db) {
      res.status(500).json({ error: "Database not configured" });
      return;
    }

    // Aggregate from llm_calls for real-time totals
    const [totals] = await db
      .select({
        totalCost: sql<number>`coalesce(sum(${llmCalls.cost}), 0)`,
        totalTokens: sql<number>`coalesce(sum(${llmCalls.totalTokens}), 0)`,
        totalCalls: sql<number>`count(*)`,
      })
      .from(llmCalls)
      .where(eq(llmCalls.workspaceId, workspaceId));

    // Cost by provider
    const byProvider = await db
      .select({
        provider: llmCalls.provider,
        cost: sql<number>`coalesce(sum(${llmCalls.cost}), 0)`,
      })
      .from(llmCalls)
      .where(eq(llmCalls.workspaceId, workspaceId))
      .groupBy(llmCalls.provider);

    const costByProvider: Record<string, number> = {};
    for (const row of byProvider) {
      costByProvider[row.provider] = Number(row.cost);
    }

    // Cost by model
    const byModel = await db
      .select({
        model: llmCalls.model,
        cost: sql<number>`coalesce(sum(${llmCalls.cost}), 0)`,
      })
      .from(llmCalls)
      .where(eq(llmCalls.workspaceId, workspaceId))
      .groupBy(llmCalls.model);

    const costByModel: Record<string, number> = {};
    for (const row of byModel) {
      costByModel[row.model] = Number(row.cost);
    }

    // Cost by agent
    const byAgent = await db
      .select({
        agentId: llmCalls.agentId,
        cost: sql<number>`coalesce(sum(${llmCalls.cost}), 0)`,
      })
      .from(llmCalls)
      .where(and(eq(llmCalls.workspaceId, workspaceId), sql`${llmCalls.agentId} is not null`))
      .groupBy(llmCalls.agentId);

    const costByAgent: Record<string, number> = {};
    for (const row of byAgent) {
      if (row.agentId) costByAgent[row.agentId] = Number(row.cost);
    }

    res.json({
      totalCost: Number(totals.totalCost),
      totalTokens: Number(totals.totalTokens),
      totalCalls: Number(totals.totalCalls),
      costByProvider,
      costByModel,
      costByAgent,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Validation failed", details: error.errors });
      return;
    }
    res.status(500).json({ error: "Failed to get cost summary" });
  }
});

// Audit Logs router
export const auditLogsRouter = Router({ mergeParams: true });

// GET /workspaces/:workspaceId/audit-logs
auditLogsRouter.get("/", async (req: Request, res: Response) => {
  try {
    const workspaceId = z.string().uuid().parse(req.params.workspaceId);
    const input = listSchema.parse(req.query);
    const { db } = req.app.locals;

    if (!db) {
      res.status(500).json({ error: "Database not configured" });
      return;
    }

    const conditions = [eq(auditLogs.workspaceId, workspaceId)];
    if (input.cursor) {
      conditions.push(gt(auditLogs.id, input.cursor));
    }

    const data = await db
      .select()
      .from(auditLogs)
      .where(and(...conditions))
      .orderBy(desc(auditLogs.createdAt))
      .limit(input.limit + 1);

    const hasMore = data.length > input.limit;
    const results = hasMore ? data.slice(0, input.limit) : data;
    const nextCursor = hasMore ? results[results.length - 1].id : undefined;

    res.json({ data: results, nextCursor, hasMore });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Validation failed", details: error.errors });
      return;
    }
    res.status(500).json({ error: "Failed to list audit logs" });
  }
});
