import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { aiUsage } from "../schema";

export type AIUsage = InferSelectModel<typeof aiUsage>;
export type NewAIUsage = InferInsertModel<typeof aiUsage>;
