import { pgTable, uuid, text, timestamp, integer, decimal, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { agents } from "./agents";
import { jobs } from "./jobs";

export const activityTypeEnum = pgEnum("activity_type", [
  "chat", "completion", "embedding", "function_call", "workflow",
]);

export const activityStatusEnum = pgEnum("activity_status", [
  "pending", "running", "success", "failed", "cancelled",
]);

export const activities = pgTable("activities", {
  id: uuid("id").primaryKey().defaultRandom(),
  agentId: uuid("agent_id").notNull().references(() => agents.id, { onDelete: "cascade" }),
  jobId: uuid("job_id").references(() => jobs.id, { onDelete: "set null" }),
  type: activityTypeEnum("type").notNull(),
  status: activityStatusEnum("status").notNull().default("pending"),
  input: text("input"),
  output: text("output"),
  errorMessage: text("error_message"),
  tokensUsed: integer("tokens_used"),
  inputTokens: integer("input_tokens"),
  outputTokens: integer("output_tokens"),
  cost: decimal("cost", { precision: 10, scale: 6 }),
  executionTime: integer("execution_time"),
  metadata: jsonb("metadata"),
  startedAt: timestamp("started_at", { withTimezone: true }),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const activitiesRelations = relations(activities, ({ one }) => ({
  agent: one(agents, { fields: [activities.agentId], references: [agents.id] }),
  job: one(jobs, { fields: [activities.jobId], references: [jobs.id] }),
}));

export type Activity = typeof activities.$inferSelect;
export type NewActivity = typeof activities.$inferInsert;
