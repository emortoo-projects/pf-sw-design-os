import { z } from "zod";

export const triggerTypes = ["manual", "cron", "webhook", "api"] as const;

export const triggerExecutionSchema = z.object({
  workflowId: z.string().uuid(),
  trigger: z.enum(triggerTypes).default("manual"),
  input: z.record(z.unknown()).optional(),
});

export type TriggerExecutionInput = z.infer<typeof triggerExecutionSchema>;
