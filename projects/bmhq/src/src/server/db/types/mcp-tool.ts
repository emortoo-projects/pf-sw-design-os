import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { mcpTools } from "../schema";

export type MCPTool = InferSelectModel<typeof mcpTools>;
export type NewMCPTool = InferInsertModel<typeof mcpTools>;
