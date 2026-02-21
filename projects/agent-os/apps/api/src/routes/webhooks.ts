import { Router, Request, Response } from "express";
import { z } from "zod";
import { webhooks, executions } from "@agent-os/database";
import { eq, and, gt, asc, sql } from "drizzle-orm";

const router = Router({ mergeParams: true });

const authTypeValues = ["none", "secret", "bearer_token"] as const;

const listSchema = z.object({
  limit: z.coerce.number().int().positive().max(100).default(20),
  cursor: z.string().uuid().optional(),
});

const createWebhookSchema = z.object({
  workflowId: z.string().uuid(),
  name: z.string().min(1).max(255),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
  enabled: z.boolean(),
  authType: z.enum(authTypeValues),
  secret: z.string().optional(),
});

const updateWebhookSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  enabled: z.boolean().optional(),
  secret: z.string().optional(),
});

// GET /workspaces/:workspaceId/webhooks
router.get("/", async (req: Request, res: Response) => {
  try {
    z.string().uuid().parse(req.params.workspaceId);
    const input = listSchema.parse(req.query);
    const { db } = req.app.locals;

    if (!db) {
      res.status(500).json({ error: "Database not configured" });
      return;
    }

    const conditions: any[] = [];
    if (input.cursor) {
      conditions.push(gt(webhooks.id, input.cursor));
    }

    const data = await db
      .select()
      .from(webhooks)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(asc(webhooks.id))
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
    res.status(500).json({ error: "Failed to list webhooks" });
  }
});

// POST /workspaces/:workspaceId/webhooks
router.post("/", async (req: Request, res: Response) => {
  try {
    z.string().uuid().parse(req.params.workspaceId);
    const input = createWebhookSchema.parse(req.body);
    const { db } = req.app.locals;
    const userId = (req as any).userId;

    if (!db) {
      res.status(500).json({ error: "Database not configured" });
      return;
    }

    const baseUrl = process.env.WEBHOOK_BASE_URL || `${req.protocol}://${req.get("host")}`;

    const [webhook] = await db
      .insert(webhooks)
      .values({
        workflowId: input.workflowId,
        name: input.name,
        slug: input.slug,
        enabled: input.enabled,
        authType: input.authType,
        secret: input.secret,
        createdBy: userId,
      })
      .returning({
        id: webhooks.id,
        workflowId: webhooks.workflowId,
        slug: webhooks.slug,
        createdAt: webhooks.createdAt,
      });

    res.status(201).json({
      ...webhook,
      url: `${baseUrl}/webhooks/${webhook.slug}`,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Validation failed", details: error.errors });
      return;
    }
    res.status(500).json({ error: "Failed to create webhook" });
  }
});

// GET /workspaces/:workspaceId/webhooks/:webhookId
router.get("/:webhookId", async (req: Request, res: Response) => {
  try {
    z.string().uuid().parse(req.params.workspaceId);
    const webhookId = z.string().uuid().parse(req.params.webhookId);
    const { db } = req.app.locals;

    if (!db) {
      res.status(500).json({ error: "Database not configured" });
      return;
    }

    const [webhook] = await db
      .select()
      .from(webhooks)
      .where(eq(webhooks.id, webhookId))
      .limit(1);

    if (!webhook) {
      res.status(404).json({ error: "Webhook not found" });
      return;
    }

    const baseUrl = process.env.WEBHOOK_BASE_URL || `${req.protocol}://${req.get("host")}`;

    res.json({
      ...webhook,
      url: `${baseUrl}/webhooks/${webhook.slug}`,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Invalid ID" });
      return;
    }
    res.status(500).json({ error: "Failed to get webhook" });
  }
});

// PUT /workspaces/:workspaceId/webhooks/:webhookId
router.put("/:webhookId", async (req: Request, res: Response) => {
  try {
    z.string().uuid().parse(req.params.workspaceId);
    const webhookId = z.string().uuid().parse(req.params.webhookId);
    const input = updateWebhookSchema.parse(req.body);
    const { db } = req.app.locals;

    if (!db) {
      res.status(500).json({ error: "Database not configured" });
      return;
    }

    const updateValues: Record<string, unknown> = { updatedAt: new Date() };
    if (input.name !== undefined) updateValues.name = input.name;
    if (input.enabled !== undefined) updateValues.enabled = input.enabled;
    if (input.secret !== undefined) updateValues.secret = input.secret;

    const [webhook] = await db
      .update(webhooks)
      .set(updateValues)
      .where(eq(webhooks.id, webhookId))
      .returning({
        id: webhooks.id,
        updatedAt: webhooks.updatedAt,
      });

    if (!webhook) {
      res.status(404).json({ error: "Webhook not found" });
      return;
    }

    res.json(webhook);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Validation failed", details: error.errors });
      return;
    }
    res.status(500).json({ error: "Failed to update webhook" });
  }
});

// DELETE /workspaces/:workspaceId/webhooks/:webhookId
router.delete("/:webhookId", async (req: Request, res: Response) => {
  try {
    z.string().uuid().parse(req.params.workspaceId);
    const webhookId = z.string().uuid().parse(req.params.webhookId);
    const { db } = req.app.locals;

    if (!db) {
      res.status(500).json({ error: "Database not configured" });
      return;
    }

    const [deleted] = await db
      .delete(webhooks)
      .where(eq(webhooks.id, webhookId))
      .returning({ id: webhooks.id });

    if (!deleted) {
      res.status(404).json({ error: "Webhook not found" });
      return;
    }

    res.status(204).send();
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Invalid ID" });
      return;
    }
    res.status(500).json({ error: "Failed to delete webhook" });
  }
});

// Webhook trigger router - mounted at /webhooks (not workspace-scoped)
export const webhookTriggerRouter = Router();

webhookTriggerRouter.post("/:slug", async (req: Request, res: Response) => {
  try {
    const slug = z.string().min(1).parse(req.params.slug);
    const payload = req.body;
    const { db } = req.app.locals;

    if (!db) {
      res.status(500).json({ error: "Database not configured" });
      return;
    }

    // Find webhook by slug
    const [webhook] = await db
      .select()
      .from(webhooks)
      .where(eq(webhooks.slug, slug))
      .limit(1);

    if (!webhook) {
      res.status(404).json({ error: "Webhook not found" });
      return;
    }

    if (!webhook.enabled) {
      res.status(403).json({ error: "Webhook is disabled" });
      return;
    }

    // Create execution for the linked workflow
    const [execution] = await db
      .insert(executions)
      .values({
        workflowId: webhook.workflowId,
        workspaceId: webhook.workflowId, // Will be resolved through workflow relation in production
        triggeredBy: "webhook",
        input: payload || {},
      })
      .returning({
        executionId: executions.id,
        status: executions.status,
      });

    // Update webhook trigger stats
    await db
      .update(webhooks)
      .set({
        lastTriggeredAt: new Date(),
        totalTriggers: sql`${webhooks.totalTriggers} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(webhooks.id, webhook.id));

    res.status(202).json(execution);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Invalid slug" });
      return;
    }
    res.status(500).json({ error: "Webhook trigger failed" });
  }
});

export default router;
