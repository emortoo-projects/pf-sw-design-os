import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./users";
import { agents, providerTypeEnum } from "./agents";

export const apiCredentials = pgTable("api_credentials", {
  id: uuid("id").primaryKey().defaultRandom(),
  provider: providerTypeEnum("provider").notNull(),
  apiKey: text("api_key").notNull(),
  name: text("name").notNull(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  agentId: uuid("agent_id").references(() => agents.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const apiCredentialsRelations = relations(apiCredentials, ({ one }) => ({
  user: one(users, { fields: [apiCredentials.userId], references: [users.id] }),
  agent: one(agents, { fields: [apiCredentials.agentId], references: [agents.id] }),
}));

export type ApiCredential = typeof apiCredentials.$inferSelect;
export type NewApiCredential = typeof apiCredentials.$inferInsert;
