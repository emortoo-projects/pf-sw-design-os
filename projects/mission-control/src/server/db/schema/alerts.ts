import { pgTable, uuid, text, timestamp, boolean, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./users";

export const alertTypeEnum = pgEnum("alert_type", [
  "budget_threshold", "agent_error", "job_stuck", "performance_anomaly", "credential_expiry",
]);

export const alertSeverityEnum = pgEnum("alert_severity", [
  "info", "warning", "error", "critical",
]);

export const alertStatusEnum = pgEnum("alert_status", [
  "unread", "read", "dismissed", "resolved",
]);

export const entityTypeEnum = pgEnum("entity_type", [
  "agent", "job", "budget", "activity", "credential",
]);

export const alertRuleScopeEnum = pgEnum("alert_rule_scope", [
  "global", "project", "agent",
]);

export const alerts = pgTable("alerts", {
  id: uuid("id").primaryKey().defaultRandom(),
  type: alertTypeEnum("type").notNull(),
  severity: alertSeverityEnum("severity").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  status: alertStatusEnum("status").notNull().default("unread"),
  entityType: entityTypeEnum("entity_type"),
  entityId: uuid("entity_id"),
  metadata: jsonb("metadata"),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  readAt: timestamp("read_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const alertsRelations = relations(alerts, ({ one }) => ({
  user: one(users, { fields: [alerts.userId], references: [users.id] }),
}));

export const alertRules = pgTable("alert_rules", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  type: alertTypeEnum("type").notNull(),
  enabled: boolean("enabled").notNull().default(true),
  conditions: jsonb("conditions").notNull(),
  scope: alertRuleScopeEnum("scope").notNull(),
  scopeId: uuid("scope_id"),
  notificationChannels: jsonb("notification_channels").notNull(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const alertRulesRelations = relations(alertRules, ({ one }) => ({
  user: one(users, { fields: [alertRules.userId], references: [users.id] }),
}));

export type Alert = typeof alerts.$inferSelect;
export type NewAlert = typeof alerts.$inferInsert;
export type AlertRule = typeof alertRules.$inferSelect;
export type NewAlertRule = typeof alertRules.$inferInsert;
