import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { aiProviders } from "../schema";

export type AIProvider = InferSelectModel<typeof aiProviders>;
export type NewAIProvider = InferInsertModel<typeof aiProviders>;
