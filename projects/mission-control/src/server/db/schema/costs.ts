import { pgTable, uuid, text, timestamp, integer, decimal } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { activities } from "./activities";
import { agents, providerTypeEnum } from "./agents";
import { projects } from "./projects";
import { users } from "./users";

export const costRecords = pgTable("cost_records", {
  id: uuid("id").primaryKey().defaultRandom(),
  activityId: uuid("activity_id").notNull().references(() => activities.id, { onDelete: "cascade" }),
  agentId: uuid("agent_id").notNull().references(() => agents.id, { onDelete: "cascade" }),
  projectId: uuid("project_id").references(() => projects.id, { onDelete: "set null" }),
  provider: providerTypeEnum("provider").notNull(),
  model: text("model").notNull(),
  inputTokens: integer("input_tokens"),
  outputTokens: integer("output_tokens"),
  totalTokens: integer("total_tokens"),
  inputCost: decimal("input_cost", { precision: 10, scale: 6 }),
  outputCost: decimal("output_cost", { precision: 10, scale: 6 }),
  totalCost: decimal("total_cost", { precision: 10, scale: 6 }).notNull(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const costRecordsRelations = relations(costRecords, ({ one }) => ({
  activity: one(activities, { fields: [costRecords.activityId], references: [activities.id] }),
  agent: one(agents, { fields: [costRecords.agentId], references: [agents.id] }),
  project: one(projects, { fields: [costRecords.projectId], references: [projects.id] }),
  user: one(users, { fields: [costRecords.userId], references: [users.id] }),
}));

export type CostRecord = typeof costRecords.$inferSelect;
export type NewCostRecord = typeof costRecords.$inferInsert;
