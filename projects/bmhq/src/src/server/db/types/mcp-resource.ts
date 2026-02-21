import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { mcpResources } from "../schema";

export type MCPResource = InferSelectModel<typeof mcpResources>;
export type NewMCPResource = InferInsertModel<typeof mcpResources>;
