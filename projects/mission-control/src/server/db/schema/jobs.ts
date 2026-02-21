import { pgTable, uuid, text, timestamp, integer, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./users";
import { agents } from "./agents";

export const jobTypeEnum = pgEnum("job_type", ["scheduled", "manual", "triggered"]);

export const jobStatusEnum = pgEnum("job_status", [
  "pending", "queued", "running", "completed", "failed", "cancelled", "paused",
]);

export const jobExecutionStatusEnum = pgEnum("job_execution_status", [
  "pending", "running", "success", "failed", "cancelled",
]);

export const jobs = pgTable("jobs", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  agentId: uuid("agent_id").notNull().references(() => agents.id, { onDelete: "cascade" }),
  type: jobTypeEnum("type").notNull(),
  cronExpression: text("cron_expression"),
  status: jobStatusEnum("status").notNull().default("pending"),
  priority: integer("priority").notNull().default(0),
  payload: jsonb("payload"),
  retryPolicy: jsonb("retry_policy"),
  retryCount: integer("retry_count").notNull().default(0),
  lastRunAt: timestamp("last_run_at", { withTimezone: true }),
  nextRunAt: timestamp("next_run_at", { withTimezone: true }),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const jobsRelations = relations(jobs, ({ one }) => ({
  agent: one(agents, { fields: [jobs.agentId], references: [agents.id] }),
  user: one(users, { fields: [jobs.userId], references: [users.id] }),
}));

export const jobExecutions = pgTable("job_executions", {
  id: uuid("id").primaryKey().defaultRandom(),
  jobId: uuid("job_id").notNull().references(() => jobs.id, { onDelete: "cascade" }),
  status: jobExecutionStatusEnum("status").notNull().default("pending"),
  errorMessage: text("error_message"),
  output: jsonb("output"),
  duration: integer("duration"),
  startedAt: timestamp("started_at", { withTimezone: true }),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const jobExecutionsRelations = relations(jobExecutions, ({ one }) => ({
  job: one(jobs, { fields: [jobExecutions.jobId], references: [jobs.id] }),
}));

export type Job = typeof jobs.$inferSelect;
export type NewJob = typeof jobs.$inferInsert;
export type JobExecution = typeof jobExecutions.$inferSelect;
export type NewJobExecution = typeof jobExecutions.$inferInsert;
