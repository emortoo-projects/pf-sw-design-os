import { Router, Request, Response } from "express";
import { z } from "zod";
import { credentials } from "@agent-os/database";
import { eq, and, gt, asc } from "drizzle-orm";

const router = Router({ mergeParams: true });

const credentialTypeValues = ["api_key", "bearer_token", "basic_auth", "oauth2", "custom"] as const;
const credentialProviderValues = ["openai", "anthropic", "n8n", "crewai", "langgraph", "custom"] as const;

const listSchema = z.object({
  limit: z.coerce.number().int().positive().max(100).default(20),
  cursor: z.string().uuid().optional(),
});

const createCredentialSchema = z.object({
  name: z.string().min(1).max(255),
  type: z.enum(credentialTypeValues),
  provider: z.enum(credentialProviderValues).optional(),
  value: z.string().min(1),
  metadata: z.record(z.unknown()).optional(),
});

const updateCredentialSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  value: z.string().min(1).optional(),
  metadata: z.record(z.unknown()).optional(),
});

const rotateSchema = z.object({
  newValue: z.string().min(1),
});

// GET /workspaces/:workspaceId/credentials
router.get("/", async (req: Request, res: Response) => {
  try {
    const workspaceId = z.string().uuid().parse(req.params.workspaceId);
    const input = listSchema.parse(req.query);
    const { db } = req.app.locals;

    if (!db) {
      res.status(500).json({ error: "Database not configured" });
      return;
    }

    const conditions = [eq(credentials.workspaceId, workspaceId)];
    if (input.cursor) {
      conditions.push(gt(credentials.id, input.cursor));
    }

    const data = await db
      .select({
        id: credentials.id,
        name: credentials.name,
        type: credentials.type,
        provider: credentials.provider,
        metadata: credentials.metadata,
        expiresAt: credentials.expiresAt,
        lastRotatedAt: credentials.lastRotatedAt,
        createdAt: credentials.createdAt,
        updatedAt: credentials.updatedAt,
      })
      .from(credentials)
      .where(and(...conditions))
      .orderBy(asc(credentials.id))
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
    res.status(500).json({ error: "Failed to list credentials" });
  }
});

// POST /workspaces/:workspaceId/credentials
router.post("/", async (req: Request, res: Response) => {
  try {
    const workspaceId = z.string().uuid().parse(req.params.workspaceId);
    const input = createCredentialSchema.parse(req.body);
    const { db } = req.app.locals;
    const userId = (req as any).userId;

    if (!db) {
      res.status(500).json({ error: "Database not configured" });
      return;
    }

    // In production, encrypt the value before storing
    const [credential] = await db
      .insert(credentials)
      .values({
        workspaceId,
        name: input.name,
        type: input.type,
        provider: input.provider,
        encryptedValue: input.value, // Should be encrypted in production
        metadata: input.metadata || {},
        createdBy: userId,
      })
      .returning({
        id: credentials.id,
        name: credentials.name,
        type: credentials.type,
        provider: credentials.provider,
        createdAt: credentials.createdAt,
      });

    res.status(201).json(credential);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Validation failed", details: error.errors });
      return;
    }
    res.status(500).json({ error: "Failed to create credential" });
  }
});

// GET /workspaces/:workspaceId/credentials/:credentialId
router.get("/:credentialId", async (req: Request, res: Response) => {
  try {
    const workspaceId = z.string().uuid().parse(req.params.workspaceId);
    const credentialId = z.string().uuid().parse(req.params.credentialId);
    const { db } = req.app.locals;

    if (!db) {
      res.status(500).json({ error: "Database not configured" });
      return;
    }

    const [credential] = await db
      .select({
        id: credentials.id,
        name: credentials.name,
        type: credentials.type,
        provider: credentials.provider,
        metadata: credentials.metadata,
        expiresAt: credentials.expiresAt,
        lastRotatedAt: credentials.lastRotatedAt,
        createdAt: credentials.createdAt,
        updatedAt: credentials.updatedAt,
      })
      .from(credentials)
      .where(and(eq(credentials.id, credentialId), eq(credentials.workspaceId, workspaceId)))
      .limit(1);

    if (!credential) {
      res.status(404).json({ error: "Credential not found" });
      return;
    }

    res.json(credential);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Invalid ID" });
      return;
    }
    res.status(500).json({ error: "Failed to get credential" });
  }
});

// PUT /workspaces/:workspaceId/credentials/:credentialId
router.put("/:credentialId", async (req: Request, res: Response) => {
  try {
    const workspaceId = z.string().uuid().parse(req.params.workspaceId);
    const credentialId = z.string().uuid().parse(req.params.credentialId);
    const input = updateCredentialSchema.parse(req.body);
    const { db } = req.app.locals;

    if (!db) {
      res.status(500).json({ error: "Database not configured" });
      return;
    }

    const updateValues: Record<string, unknown> = { updatedAt: new Date() };
    if (input.name !== undefined) updateValues.name = input.name;
    if (input.value !== undefined) updateValues.encryptedValue = input.value; // Should encrypt
    if (input.metadata !== undefined) updateValues.metadata = input.metadata;

    const [credential] = await db
      .update(credentials)
      .set(updateValues)
      .where(and(eq(credentials.id, credentialId), eq(credentials.workspaceId, workspaceId)))
      .returning({
        id: credentials.id,
        updatedAt: credentials.updatedAt,
      });

    if (!credential) {
      res.status(404).json({ error: "Credential not found" });
      return;
    }

    res.json(credential);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Validation failed", details: error.errors });
      return;
    }
    res.status(500).json({ error: "Failed to update credential" });
  }
});

// DELETE /workspaces/:workspaceId/credentials/:credentialId
router.delete("/:credentialId", async (req: Request, res: Response) => {
  try {
    const workspaceId = z.string().uuid().parse(req.params.workspaceId);
    const credentialId = z.string().uuid().parse(req.params.credentialId);
    const { db } = req.app.locals;

    if (!db) {
      res.status(500).json({ error: "Database not configured" });
      return;
    }

    const [deleted] = await db
      .delete(credentials)
      .where(and(eq(credentials.id, credentialId), eq(credentials.workspaceId, workspaceId)))
      .returning({ id: credentials.id });

    if (!deleted) {
      res.status(404).json({ error: "Credential not found" });
      return;
    }

    res.status(204).send();
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Invalid ID" });
      return;
    }
    res.status(500).json({ error: "Failed to delete credential" });
  }
});

// POST /workspaces/:workspaceId/credentials/:credentialId/rotate
router.post("/:credentialId/rotate", async (req: Request, res: Response) => {
  try {
    const workspaceId = z.string().uuid().parse(req.params.workspaceId);
    const credentialId = z.string().uuid().parse(req.params.credentialId);
    const input = rotateSchema.parse(req.body);
    const { db } = req.app.locals;

    if (!db) {
      res.status(500).json({ error: "Database not configured" });
      return;
    }

    const now = new Date();
    const [credential] = await db
      .update(credentials)
      .set({
        encryptedValue: input.newValue, // Should encrypt in production
        lastRotatedAt: now,
        updatedAt: now,
      })
      .where(and(eq(credentials.id, credentialId), eq(credentials.workspaceId, workspaceId)))
      .returning({
        id: credentials.id,
        lastRotatedAt: credentials.lastRotatedAt,
      });

    if (!credential) {
      res.status(404).json({ error: "Credential not found" });
      return;
    }

    res.json(credential);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Validation failed", details: error.errors });
      return;
    }
    res.status(500).json({ error: "Failed to rotate credential" });
  }
});

export default router;
