import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { apiKeys } from "../schema";

export type APIKey = InferSelectModel<typeof apiKeys>;
export type NewAPIKey = InferInsertModel<typeof apiKeys>;
