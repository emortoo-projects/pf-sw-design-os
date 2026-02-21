import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { aiConfigurations } from "../schema";

export type AIConfiguration = InferSelectModel<typeof aiConfigurations>;
export type NewAIConfiguration = InferInsertModel<typeof aiConfigurations>;
