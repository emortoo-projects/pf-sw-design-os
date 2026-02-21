import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { auditLogs } from "../schema";

export type AuditLog = InferSelectModel<typeof auditLogs>;
export type NewAuditLog = InferInsertModel<typeof auditLogs>;
