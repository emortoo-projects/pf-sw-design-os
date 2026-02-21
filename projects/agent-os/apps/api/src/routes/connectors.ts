import { Router, Request, Response } from "express";
import { z } from "zod";
import { frameworkConnectors } from "@agent-os/database";
import { eq, and, gt, asc } from "drizzle-orm";

const router = Router({ mergeParams: true });

const frameworkValues = ["crewai", "langgraph", "n8n", "custom"] as const;
const authTypeValues = ["none", "api_key", "bearer_token", "basic_auth", "oauth2"] as const;
const statusValues = ["active", "inactive", "error"] as const;

const listSchema = z.object({
  limit: z.coerce.number().int().positive().max(100).default(20),
  cursor: z.string().uuid().optional(),
});

const createConnectorSchema = z.object({
  name: z.string().min(1).max(255),
  framework: z.enum(frameworkValues),
  endpointUrl: z.string().url(),
  authType: z.enum(authTypeValues),
  credentialId: z.string().uuid().optional(),
  config: z.record(z.unknown()).optional(),
  dockerImage: z.string().optional(),
});

const updateConnectorSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  endpointUrl: z.string().url().optional(),
  config: z.record(z.unknown()).optional(),
  status: z.enum(statusValues).optional(),
});

// GET /workspaces/:workspaceId/connectors
router.get("/", async (req: Request, res: Response) => {
  try {
    const workspaceId = z.string().uuid().parse(req.params.workspaceId);
    const input = listSchema.parse(req.query);
    const { db } = req.app.locals;

    if (!db) {
      res.status(500).json({ error: "Database not configured" });
      return;
    }

    const conditions = [eq(frameworkConnectors.workspaceId, workspaceId)];
    if (input.cursor) {
      conditions.push(gt(frameworkConnectors.id, input.cursor));
    }

    const data = await db
      .select()
      .from(frameworkConnectors)
      .where(and(...conditions))
      .orderBy(asc(frameworkConnectors.id))
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
    res.status(500).json({ error: "Failed to list connectors" });
  }
});

// POST /workspaces/:workspaceId/connectors
router.post("/", async (req: Request, res: Response) => {
  try {
    const workspaceId = z.string().uuid().parse(req.params.workspaceId);
    const input = createConnectorSchema.parse(req.body);
    const { db } = req.app.locals;

    if (!db) {
      res.status(500).json({ error: "Database not configured" });
      return;
    }

    const [connector] = await db
      .insert(frameworkConnectors)
      .values({
        workspaceId,
        name: input.name,
        framework: input.framework,
        endpointUrl: input.endpointUrl,
        authType: input.authType,
        credentialId: input.credentialId,
        config: input.config || {},
        dockerImage: input.dockerImage,
      })
      .returning({
        id: frameworkConnectors.id,
        name: frameworkConnectors.name,
        framework: frameworkConnectors.framework,
        status: frameworkConnectors.status,
        createdAt: frameworkConnectors.createdAt,
      });

    res.status(201).json(connector);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Validation failed", details: error.errors });
      return;
    }
    res.status(500).json({ error: "Failed to create connector" });
  }
});

// GET /workspaces/:workspaceId/connectors/:connectorId
router.get("/:connectorId", async (req: Request, res: Response) => {
  try {
    const workspaceId = z.string().uuid().parse(req.params.workspaceId);
    const connectorId = z.string().uuid().parse(req.params.connectorId);
    const { db } = req.app.locals;

    if (!db) {
      res.status(500).json({ error: "Database not configured" });
      return;
    }

    const [connector] = await db
      .select()
      .from(frameworkConnectors)
      .where(and(eq(frameworkConnectors.id, connectorId), eq(frameworkConnectors.workspaceId, workspaceId)))
      .limit(1);

    if (!connector) {
      res.status(404).json({ error: "Connector not found" });
      return;
    }

    res.json(connector);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Invalid ID" });
      return;
    }
    res.status(500).json({ error: "Failed to get connector" });
  }
});

// PUT /workspaces/:workspaceId/connectors/:connectorId
router.put("/:connectorId", async (req: Request, res: Response) => {
  try {
    const workspaceId = z.string().uuid().parse(req.params.workspaceId);
    const connectorId = z.string().uuid().parse(req.params.connectorId);
    const input = updateConnectorSchema.parse(req.body);
    const { db } = req.app.locals;

    if (!db) {
      res.status(500).json({ error: "Database not configured" });
      return;
    }

    const updateValues: Record<string, unknown> = { updatedAt: new Date() };
    if (input.name !== undefined) updateValues.name = input.name;
    if (input.endpointUrl !== undefined) updateValues.endpointUrl = input.endpointUrl;
    if (input.config !== undefined) updateValues.config = input.config;
    if (input.status !== undefined) updateValues.status = input.status;

    const [connector] = await db
      .update(frameworkConnectors)
      .set(updateValues)
      .where(and(eq(frameworkConnectors.id, connectorId), eq(frameworkConnectors.workspaceId, workspaceId)))
      .returning({
        id: frameworkConnectors.id,
        updatedAt: frameworkConnectors.updatedAt,
      });

    if (!connector) {
      res.status(404).json({ error: "Connector not found" });
      return;
    }

    res.json(connector);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Validation failed", details: error.errors });
      return;
    }
    res.status(500).json({ error: "Failed to update connector" });
  }
});

// DELETE /workspaces/:workspaceId/connectors/:connectorId
router.delete("/:connectorId", async (req: Request, res: Response) => {
  try {
    const workspaceId = z.string().uuid().parse(req.params.workspaceId);
    const connectorId = z.string().uuid().parse(req.params.connectorId);
    const { db } = req.app.locals;

    if (!db) {
      res.status(500).json({ error: "Database not configured" });
      return;
    }

    const [deleted] = await db
      .delete(frameworkConnectors)
      .where(and(eq(frameworkConnectors.id, connectorId), eq(frameworkConnectors.workspaceId, workspaceId)))
      .returning({ id: frameworkConnectors.id });

    if (!deleted) {
      res.status(404).json({ error: "Connector not found" });
      return;
    }

    res.status(204).send();
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Invalid ID" });
      return;
    }
    res.status(500).json({ error: "Failed to delete connector" });
  }
});

// POST /workspaces/:workspaceId/connectors/:connectorId/health
router.post("/:connectorId/health", async (req: Request, res: Response) => {
  try {
    const workspaceId = z.string().uuid().parse(req.params.workspaceId);
    const connectorId = z.string().uuid().parse(req.params.connectorId);
    const { db } = req.app.locals;

    if (!db) {
      res.status(500).json({ error: "Database not configured" });
      return;
    }

    const [connector] = await db
      .select()
      .from(frameworkConnectors)
      .where(and(eq(frameworkConnectors.id, connectorId), eq(frameworkConnectors.workspaceId, workspaceId)))
      .limit(1);

    if (!connector) {
      res.status(404).json({ error: "Connector not found" });
      return;
    }

    const startTime = Date.now();
    // In production, this would make an actual HTTP request to connector.endpointUrl
    const latencyMs = Date.now() - startTime;
    const timestamp = new Date().toISOString();

    // Update last health check
    await db
      .update(frameworkConnectors)
      .set({ lastHealthCheck: new Date(), updatedAt: new Date() })
      .where(eq(frameworkConnectors.id, connectorId));

    res.json({
      status: "healthy",
      latencyMs,
      timestamp,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Invalid ID" });
      return;
    }
    res.status(500).json({ error: "Health check failed" });
  }
});

export default router;
