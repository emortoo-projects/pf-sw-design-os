import { pgTable, uuid, text, timestamp, decimal, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./users";

export const budgetPeriodEnum = pgEnum("budget_period", [
  "daily", "weekly", "monthly", "yearly", "total",
]);

export const budgetScopeEnum = pgEnum("budget_scope", [
  "global", "project", "agent", "user",
]);

export const budgets = pgTable("budgets", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  limit: decimal("limit", { precision: 10, scale: 2 }).notNull(),
  period: budgetPeriodEnum("period").notNull(),
  scope: budgetScopeEnum("scope").notNull(),
  scopeId: uuid("scope_id"),
  currentSpend: decimal("current_spend", { precision: 10, scale: 6 }).notNull().default("0"),
  alertThresholds: jsonb("alert_thresholds"),
  periodStart: timestamp("period_start", { withTimezone: true }).notNull(),
  periodEnd: timestamp("period_end", { withTimezone: true }).notNull(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const budgetsRelations = relations(budgets, ({ one }) => ({
  user: one(users, { fields: [budgets.userId], references: [users.id] }),
}));

export type Budget = typeof budgets.$inferSelect;
export type NewBudget = typeof budgets.$inferInsert;
