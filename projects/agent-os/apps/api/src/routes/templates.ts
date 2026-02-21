import { Router, Request, Response } from "express";
import { z } from "zod";
import { templates, agents, workflows } from "@agent-os/database";
import { eq, and, gt, asc, sql } from "drizzle-orm";

const templateTypeValues = ["agent", "workflow"] as const;

const listSchema = z.object({
  limit: z.coerce.number().int().positive().max(100).default(20),
  cursor: z.string().uuid().optional(),
});

const createTemplateSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  type: z.enum(templateTypeValues),
  category: z.string().optional(),
  definition: z.record(z.unknown()),
  isPublic: z.boolean(),
  tags: z.array(z.string()).optional(),
});

const useTemplateSchema = z.object({
  name: z.string().min(1).max(255),
  customization: z.record(z.unknown()).optional(),
});

// Workspace-scoped templates router
const router = Router({ mergeParams: true });

// GET /workspaces/:workspaceId/templates
router.get("/", async (req: Request, res: Response) => {
  try {
    const workspaceId = z.string().uuid().parse(req.params.workspaceId);
    const input = listSchema.parse(req.query);
    const { db } = req.app.locals;

    if (!db) {
      res.status(500).json({ error: "Database not configured" });
      return;
    }

    const conditions = [eq(templates.workspaceId, workspaceId)];
    if (input.cursor) {
      conditions.push(gt(templates.id, input.cursor));
    }

    const data = await db
      .select()
      .from(templates)
      .where(and(...conditions))
      .orderBy(asc(templates.id))
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
    res.status(500).json({ error: "Failed to list templates" });
  }
});

// POST /workspaces/:workspaceId/templates
router.post("/", async (req: Request, res: Response) => {
  try {
    const workspaceId = z.string().uuid().parse(req.params.workspaceId);
    const input = createTemplateSchema.parse(req.body);
    const { db } = req.app.locals;
    const userId = (req as any).userId;

    if (!db) {
      res.status(500).json({ error: "Database not configured" });
      return;
    }

    const [template] = await db
      .insert(templates)
      .values({
        workspaceId,
        name: input.name,
        description: input.description,
        type: input.type,
        category: input.category,
        definition: input.definition,
        isPublic: input.isPublic,
        tags: input.tags || [],
        createdBy: userId,
      })
      .returning({
        id: templates.id,
        name: templates.name,
        type: templates.type,
        createdAt: templates.createdAt,
      });

    res.status(201).json(template);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Validation failed", details: error.errors });
      return;
    }
    res.status(500).json({ error: "Failed to create template" });
  }
});

// DELETE /workspaces/:workspaceId/templates/:templateId
router.delete("/:templateId", async (req: Request, res: Response) => {
  try {
    const workspaceId = z.string().uuid().parse(req.params.workspaceId);
    const templateId = z.string().uuid().parse(req.params.templateId);
    const { db } = req.app.locals;

    if (!db) {
      res.status(500).json({ error: "Database not configured" });
      return;
    }

    const [deleted] = await db
      .delete(templates)
      .where(and(eq(templates.id, templateId), eq(templates.workspaceId, workspaceId)))
      .returning({ id: templates.id });

    if (!deleted) {
      res.status(404).json({ error: "Template not found" });
      return;
    }

    res.status(204).send();
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Invalid ID" });
      return;
    }
    res.status(500).json({ error: "Failed to delete template" });
  }
});

// POST /workspaces/:workspaceId/templates/:templateId/use
router.post("/:templateId/use", async (req: Request, res: Response) => {
  try {
    const workspaceId = z.string().uuid().parse(req.params.workspaceId);
    const templateId = z.string().uuid().parse(req.params.templateId);
    const input = useTemplateSchema.parse(req.body);
    const { db } = req.app.locals;
    const userId = (req as any).userId;

    if (!db) {
      res.status(500).json({ error: "Database not configured" });
      return;
    }

    // Fetch the template
    const [template] = await db
      .select()
      .from(templates)
      .where(eq(templates.id, templateId))
      .limit(1);

    if (!template) {
      res.status(404).json({ error: "Template not found" });
      return;
    }

    let entityId: string;
    const entityType = template.type;

    // Create entity from template based on type
    if (template.type === "agent") {
      const def = template.definition as Record<string, any>;
      const [agent] = await db
        .insert(agents)
        .values({
          workspaceId,
          name: input.name,
          description: def.description || template.description,
          provider: def.provider || "custom",
          model: def.model || "gpt-4",
          systemPrompt: def.systemPrompt || "",
          configuration: { ...def.configuration, ...input.customization },
          createdBy: userId,
        })
        .returning({ id: agents.id });
      entityId = agent.id;
    } else {
      const def = template.definition as Record<string, any>;
      const [workflow] = await db
        .insert(workflows)
        .values({
          workspaceId,
          name: input.name,
          description: def.description || template.description,
          canvas: def.canvas || {},
          tags: def.tags || [],
          createdBy: userId,
        })
        .returning({ id: workflows.id });
      entityId = workflow.id;
    }

    // Increment usage count
    await db
      .update(templates)
      .set({
        usageCount: sql`${templates.usageCount} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(templates.id, templateId));

    res.status(201).json({
      entityType,
      entityId,
      name: input.name,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Validation failed", details: error.errors });
      return;
    }
    res.status(500).json({ error: "Failed to use template" });
  }
});

// Public templates router (not workspace-scoped)
export const publicTemplatesRouter = Router();

// GET /templates
publicTemplatesRouter.get("/", async (req: Request, res: Response) => {
  try {
    const input = listSchema.parse(req.query);
    const { db } = req.app.locals;

    if (!db) {
      res.status(500).json({ error: "Database not configured" });
      return;
    }

    const conditions = [eq(templates.isPublic, true)];
    if (input.cursor) {
      conditions.push(gt(templates.id, input.cursor));
    }

    const data = await db
      .select()
      .from(templates)
      .where(and(...conditions))
      .orderBy(asc(templates.id))
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
    res.status(500).json({ error: "Failed to list public templates" });
  }
});

// GET /templates/:templateId
publicTemplatesRouter.get("/:templateId", async (req: Request, res: Response) => {
  try {
    const templateId = z.string().uuid().parse(req.params.templateId);
    const { db } = req.app.locals;

    if (!db) {
      res.status(500).json({ error: "Database not configured" });
      return;
    }

    const [template] = await db
      .select()
      .from(templates)
      .where(eq(templates.id, templateId))
      .limit(1);

    if (!template) {
      res.status(404).json({ error: "Template not found" });
      return;
    }

    res.json(template);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Invalid ID" });
      return;
    }
    res.status(500).json({ error: "Failed to get template" });
  }
});

export default router;
