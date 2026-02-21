import { pgTable, uuid, text, timestamp, integer, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./users";
import { projects } from "./projects";

export const providerTypeEnum = pgEnum("provider_type", [
  "claude", "openai", "deepseek", "openrouter", "custom",
]);

export const agentStatusEnum = pgEnum("agent_status", ["active", "paused", "archived"]);

export const agents = pgTable("agents", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  provider: providerTypeEnum("provider").notNull(),
  model: text("model").notNull(),
  systemPrompt: text("system_prompt"),
  configuration: jsonb("configuration"),
  version: integer("version").notNull().default(1),
  status: agentStatusEnum("status").notNull().default("active"),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  projectId: uuid("project_id").references(() => projects.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const agentsRelations = relations(agents, ({ one }) => ({
  user: one(users, { fields: [agents.userId], references: [users.id] }),
  project: one(projects, { fields: [agents.projectId], references: [projects.id] }),
}));

export const agentVersions = pgTable("agent_versions", {
  id: uuid("id").primaryKey().defaultRandom(),
  agentId: uuid("agent_id").notNull().references(() => agents.id, { onDelete: "cascade" }),
  version: integer("version").notNull(),
  systemPrompt: text("system_prompt"),
  configuration: jsonb("configuration"),
  changeNotes: text("change_notes"),
  createdBy: uuid("created_by").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const agentVersionsRelations = relations(agentVersions, ({ one }) => ({
  agent: one(agents, { fields: [agentVersions.agentId], references: [agents.id] }),
  creator: one(users, { fields: [agentVersions.createdBy], references: [users.id] }),
}));

export type Agent = typeof agents.$inferSelect;
export type NewAgent = typeof agents.$inferInsert;
export type AgentVersion = typeof agentVersions.$inferSelect;
export type NewAgentVersion = typeof agentVersions.$inferInsert;
